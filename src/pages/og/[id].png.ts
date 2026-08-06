import type { APIContext, GetStaticPaths } from "astro";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import satori from "satori";
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

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
	return buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	) as ArrayBuffer;
}

const regularFontBuffer = fs.readFileSync(
	path.join(
		process.cwd(),
		"src/assets/fonts/BIZUDPGothic-Regular.ttf",
	),
);

const boldFontBuffer = fs.readFileSync(
	path.join(
		process.cwd(),
		"src/assets/fonts/BIZUDPGothic-Bold.ttf",
	),
);

const regularFont = bufferToArrayBuffer(regularFontBuffer);
const boldFont = bufferToArrayBuffer(boldFontBuffer);

function splitText(text: string, maxLength = 22) {
	const characters = Array.from(text.trim());
	const lines: string[] = [];

	for (
		let index = 0;
		index < characters.length;
		index += maxLength
	) {
		lines.push(
			characters
				.slice(index, index + maxLength)
				.join(""),
		);
	}

	const visibleLines = lines.slice(0, 4);

	if (lines.length > 4) {
		const lastIndex = visibleLines.length - 1;
		const lastLine = visibleLines[lastIndex];

		visibleLines[lastIndex] =
			lastLine.slice(0, Math.max(lastLine.length - 1, 0)) + "…";
	}

	return visibleLines;
}

export async function GET({ props }: APIContext<Props>) {
	const { reply } = props;
	const lines = splitText(reply.title);

	const svg = await satori(
		{
			type: "div",
			props: {
				style: {
					width: "1200px",
					height: "630px",
					display: "flex",
					padding: "44px",
					backgroundColor: "#f2f3f4",
					fontFamily: "BIZ UDPGothic",
				},
				children: {
					type: "div",
					props: {
						style: {
							width: "100%",
							height: "100%",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							padding: "52px 70px 28px",
							border: "2px solid #dfe1e3",
							borderRadius: "20px",
							backgroundColor: "#fafafa",
						},
						children: [
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										fontSize: "22px",
										fontWeight: 700,
										letterSpacing: "6px",
										color: "#777b81",
									},
									children: "QUESTION",
								},
							},
							{
								type: "div",
								props: {
									style: {
										flex: 1,
										width: "100%",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										gap: "14px",
										fontSize: "42px",
										fontWeight: 700,
										lineHeight: 1.45,
										color: "#27292c",
									},
									children: lines.map((line) => ({
										type: "div",
										props: {
											style: {
												display: "flex",
												justifyContent: "center",
												width: "100%",
											},
											children: line,
										},
									})),
								},
							},
							{
								type: "div",
								props: {
									style: {
										width: "880px",
										height: "2px",
										display: "flex",
										backgroundColor: "#dfe1e3",
									},
								},
							},
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										marginTop: "22px",
										fontSize: "24px",
										fontWeight: 700,
										color: "#666a70",
									},
									children: "hi_garaの質問箱",
								},
							},
						],
					},
				},
			},
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: "BIZ UDPGothic",
					data: regularFont,
					weight: 400,
					style: "normal",
				},
				{
					name: "BIZ UDPGothic",
					data: boldFont,
					weight: 700,
					style: "normal",
				},
			],
		},
	);

	const png = await sharp(Buffer.from(svg))
		.png()
		.toBuffer();

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "no-cache",
		},
	});
}