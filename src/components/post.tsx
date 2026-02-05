import type React from "react";

interface PostProps {
	title: string;
	content: string;
	author: string;
	date: string;
}

const Post: React.FC<PostProps> = ({ title, content, author, date }) => {
	return (
		<div className="bg-white shadow-md rounded-lg p-6 mb-6">
			<h2 className="text-2xl font-bold mb-2">{title}</h2>
			<p className="text-gray-700 mb-4">{content}</p>
			<div className="text-sm text-gray-500">
				<span>By {author}</span> | <span>{date}</span>
			</div>
		</div>
	);
};

export default Post;
