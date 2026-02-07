// /Users/ijin-u/workspace_p/marlang-web/src/app/api/remove-admin/route.ts
import { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function DELETE(request: NextRequest) {
  try {
    // Verify the request comes from an authenticated admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Only allow if the user is already an admin
    if (!decodedToken.admin) {
      return Response.json({ error: 'Forbidden: Only admins can remove admin claims' }, { status: 403 });
    }

    const { uid } = await request.json();
    if (!uid) {
      return Response.json({ error: 'Missing UID in request body' }, { status: 400 });
    }

    // Remove custom claim for admin
    await getAuth().setCustomUserClaims(uid, {});

    // Remove user from admins collection
    await adminDb.collection('admins').doc(uid).delete();

    return Response.json({ success: true, message: `Admin claim removed for user ${uid}` });
  } catch (error) {
    console.error('Error removing admin claim:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}