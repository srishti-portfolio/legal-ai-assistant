import { unlink } from "node:fs/promises";
import { Router } from "express";
import {
  createDocument,
  deleteDocumentForUser,
  findDocumentForUser,
  listDocumentsForUser,
} from "../db/documents.repo.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadDocument } from "../middleware/upload.js";
import { runIngestPipeline } from "../services/ingest.js";
import { BadRequestError, NotFoundError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

function toPublicDocument(doc: {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  status: string;
  error_message: string | null;
  page_count: number | null;
  created_at: string;
}) {
  return {
    id: doc.id,
    name: doc.original_name,
    mimeType: doc.mime_type,
    sizeBytes: doc.size_bytes,
    status: doc.status,
    errorMessage: doc.error_message,
    pageCount: doc.page_count,
    createdAt: doc.created_at,
  };
}

documentsRouter.post(
  "/",
  (req, res, next) => {
    uploadDocument(req, res, (err) => (err ? next(err) : next()));
  },
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new BadRequestError("No file was uploaded. Attach a file under the 'file' field.");
    }

    const document = await createDocument({
      userId: req.user!.userId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      storagePath: req.file.path,
      sizeBytes: req.file.size,
    });

    // Fire-and-forget: extraction/OCR/embedding can take several seconds and the
    // client polls GET /documents/:id for status rather than holding this request open.
    void runIngestPipeline(document.id, document.storage_path, document.mime_type);

    res.status(202).json(toPublicDocument(document));
  }),
);

documentsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const documents = await listDocumentsForUser(req.user!.userId);
    res.json({ documents: documents.map(toPublicDocument) });
  }),
);

documentsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const document = await findDocumentForUser(req.params.id!, req.user!.userId);
    if (!document) throw new NotFoundError("Document not found.");
    res.json(toPublicDocument(document));
  }),
);

documentsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const document = await findDocumentForUser(req.params.id!, req.user!.userId);
    if (!document) throw new NotFoundError("Document not found.");

    await deleteDocumentForUser(document.id, req.user!.userId);
    await unlink(document.storage_path).catch(() => {
      // File may already be gone; deleting the DB record is what matters to the user.
    });

    res.status(204).send();
  }),
);
