"use server"

import { InputFile } from "node-appwrite/file"
import { createAdminClient, createSessionClient } from "../appwrite"
import { getCurrentUser, handleError } from "./user.actions"
import { appwriteConfig } from "../appwrite/config"
import { ID, Models, Query } from "node-appwrite"
import { constructFileUrl, getFileType, parseStringify } from "../utils"
import { revalidatePath } from "next/cache"

export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
    const { databases, storage } = await createAdminClient()
    try {
        const inputFile = InputFile.fromBuffer(file, file.name)
        const bucketFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), inputFile)
        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            users: [],
            bucketFileId: bucketFile.$id
        }

        const newFile = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            ID.unique(),
            fileDocument
        )
            .catch(async (e: unknown) => {
                await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
                handleError(e, "Failed to create file document")
            })
        revalidatePath(path)
        return parseStringify(newFile)
    } catch (e) {
        handleError(e, "failed to upload files")
    }
}
const createQueries = (currentUser: Models.Document, types: string[], searchText: string, sort: string, limit?: number) => {
    const queries = [
        Query.or([
            Query.equal("owner", [currentUser.$id]),
            Query.contains("users", [currentUser.email]),
        ]),
    ];
    if (types.length > 0) {
        queries.push(Query.equal("type", types))
    }
    if (searchText) {
        queries.push(Query.contains("name", [searchText]))
    }
    if (limit) {
        queries.push(Query.limit(limit))
    }
    const [sortBy, orderBy] = sort.split("-")
    queries.push(orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy))
    return queries
}
export const getFiles = async ({ types = [], searchText = "", sort = "$createdAt-desc", limit }: GetFilesProps) => {
    const { databases } = await createAdminClient()
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return null;
        }
        const queries = createQueries(currentUser, types, searchText, sort, limit)
        const files = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, queries)
        return parseStringify(files)
    } catch (e) {
        handleError(e, "Failed to get files")
    }

}

export const renameFile = async ({ fileId, name, extension, path }: RenameFileProps) => {
    const { databases } = await createAdminClient()
    try {

        const newName = `${name}.${extension}`
        const updatedFile = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId, { name: newName })
        revalidatePath(path)
        return parseStringify(updatedFile)
    }
    catch (e) {
        handleError(e, "Failed to rename the file")
    }
}
export const updateFileUsers = async ({ fileId, emails, path }: UpdateFileUsersProps) => {
    const { databases } = await createAdminClient()
    try {
        const updatedFile = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId, { users: emails })
        revalidatePath(path)
        return parseStringify(updatedFile)
    }
    catch (e) {
        handleError(e, "Failed to rename the file")
    }
}
export const DeleteFile = async ({ fileId, bucketFileId, path }: DeleteFileProps) => {
    const { databases, storage } = await createAdminClient()
    try {
        const deletedFile = await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId)
        if (deletedFile) {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFileId)
        }
        revalidatePath(path)
        return parseStringify(deletedFile)
    }
    catch (e) {
        handleError(e, "Failed to rename the file")
    }
}

export async function getTotalSpaceUsed() {
    try {
        const { databases } = await createSessionClient();
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User is not authenticated.");


        const files = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            [Query.equal("owner", [currentUser.$id])],
        );

        const totalSpace = {
            image: { size: 0, latestDate: "" },
            document: { size: 0, latestDate: "" },
            video: { size: 0, latestDate: "" },
            audio: { size: 0, latestDate: "" },
            other: { size: 0, latestDate: "" },
            used: 0,
            all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
        };

        files.documents.forEach((file) => {
            const fileType = file.type as FileType;
            totalSpace[fileType].size += file.size;
            totalSpace.used += file.size;

            if (
                !totalSpace[fileType].latestDate ||
                new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
            ) {
                totalSpace[fileType].latestDate = file.$updatedAt;
            }
        });

        return parseStringify(totalSpace);
    } catch (error) {
        handleError(error, "Error calculating total space used:, ");
    }
}