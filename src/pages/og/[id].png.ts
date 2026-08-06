import type { APIContext, GetStaticPaths } from "astro";
import sharp from "sharp";
import questions from "../../data/questions.json";

export const getStaticPaths = (() => {
	return questions
		.filter((reply) => reply.published)
		.map((reply) => ({
			params: {
				id: reply.id,
			},
			props: {
				reply,
			},
		}));
}) satisfies GetStaticPaths;

type Reply = (typeof questions)[number];

type Props = {
	reply: Reply;
};

function escapeXml(text: string) {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function splitText(text: string, maxLength = 24) {
	const characters = Array.from(text.trim());
	const lines: string[] = [];

	for (let index = 0; index < characters.length; index += maxLength) {
		lines.push(
			characters.slice(index, index + maxLength).join(""),
		);
	}

	return lines.slice(0, 4);
}

export async function GET({ props }: APIContext<Props>) {
	const { reply } = props;

	const lines = splitText(reply.title, 24);

	const textElements = lines
		.map((line, index) => {
			const y = 245 + index * 72;

			return `
				<text
					x="600"
					y="${y}"
					text-anchor="middle"
					font-family="'BIZ UDPGothic','Yu Gothic UI','Yu Gothic',sans-serif"
					font-size="44"
					font-weight="600"
					fill="#27292c"
				>${escapeXml(line)}</text>
			`;
		})
		.join("");

	const svg = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1200"
			height="630"
			viewBox="0 0 1200 630"
		>
			<rect
				width="1200"
				height="630"
				fill="#f2f3f4"
			/>

			<rect
				x="44"
				y="44"
				width="1112"
				height="542"
				rx="20"
				fill="#fafafa"
				stroke="#dfe1e3"
				stroke-width="2"
			/>

			<text
				x="600"
				y="120"
				text-anchor="middle"
				font-family="sans-serif"
				font-size="22"
				font-weight="700"
				letter-spacing="6"
				fill="#777b81"
			>QUESTION</text>

			${textElements}

			<line
				x1="160"
				y1="500"
				x2="1040"
				y2="500"
				stroke="#dfe1e3"
				stroke-width="2"
			/>

			<text
				x="600"
				y="550"
				text-anchor="middle"
				font-family="sans-serif"
				font-size="24"
				font-weight="700"
				fill="#666a70"
			>hi_garaの質問箱</text>
		</svg>
	`;

	const png = await sharp(Buffer.from(svg))
		.png()
		.toBuffer();

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}