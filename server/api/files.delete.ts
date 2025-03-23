import {defineEventHandler} from "h3";
import {promises as fs} from "fs";
import path from "path";

const METADATA_FILE = path.resolve("public/uploads/metadata.json");

export default defineEventHandler(async (event) => {
    const { id } = event.context.params; // Assuming you pass the ID in the URL

    try {
        const data = await fs.readFile(METADATA_FILE, 'utf-8');
        const files = JSON.parse(data);

        // Filter out the file to delete
        const updatedFiles = files.filter(file => file.id !== id);

        // Write the updated files back to the metadata file
        await fs.writeFile(METADATA_FILE, JSON.stringify(updatedFiles, null, 2));

        return { success: true };
    } catch (error) {
        return {
            success: false,
            message: "Could not delete the file",
            error: error instanceof Error ? error.message : error,
        };
    }
});