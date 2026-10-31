export interface EmbeddingProvider {
    embedMany(texts: string[]): Promise<number[][]>;
}

export class MockEmbeddingProvider implements EmbeddingProvider {
    async embedMany(texts: string[]): Promise<number[][]> {
        return texts.map((text) => {
            const vector = new Array(8).fill(0);
            const cleaned = text.toLowerCase();

            for (let i = 0; i < cleaned.length; i++) {
                vector[i % vector.length] += cleaned.charCodeAt(i) % 17;
            }

            return vector;
        });
    }
}