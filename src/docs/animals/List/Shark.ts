import { Animal } from "../Animal";

export const Shark: Animal = {
    name: "Shark",
    emoji: "<:shark:958750276897095750>",
    cost: {
        type: "coins",
        amount: 15_000_000
    },
    needLevel: 25,
    family: "ocean",
    reputation: 8000,
    spaceTake: 1500,
    makingTimeAndLost: "10d",
    gives: "shark_trunk"
}