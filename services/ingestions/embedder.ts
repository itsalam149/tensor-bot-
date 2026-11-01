export interface EmbeddingProvider {
    embedMany(texts: string[]): Promise<number[][]>;
}

export class MockEmbeddingProvider implements EmbeddingProvider {
    async embedMany(texts: string[]): Promise<number[][]> {
        return texts.map((text) => {
            const vector = new Array(768).fill(0);
            const cleaned = text.toLowerCase();

            for (let i = 0; i < cleaned.length; i++) {
                vector[i % vector.length] = ((vector[i % vector.length] + cleaned.charCodeAt(i) * 0.001) % 1);
            }

            return vector;
        });
    }
}