import { createCanvas, loadImage } from "canvas";
import { Util } from "client-discord";
import { MessageAttachment } from "discord.js";
import { STAR_IMG } from "../config";

export class StarImage {
    constructor(private readonly level: number) { }

    async build() {
        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = await loadImage(STAR_IMG);
        ctx.textAlign = "center";

        ctx.drawImage(
            img,
            0,
            0,
            img.width < canvas.width ? img.width : canvas.width,
            img.height < canvas.height ? img.height : canvas.height
        );

        ctx.fillStyle = "#000000";
        const fontSize = canvas.width / 2 - 20
        ctx.font = `bold ${fontSize}px 'Trebuchet MS'`;

        const maxWidth = canvas.width / 2;
        
        ctx.fillText(
            Util.formatNumber(this.level),
            canvas.width - maxWidth,
            canvas.height / 2 + fontSize / 2 - 20,
            maxWidth
        )

        return new MessageAttachment(canvas.toBuffer(), "star.png")

    }
}