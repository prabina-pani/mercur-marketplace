import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"
import cors from "cors"

// Configure multer with size limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 2, // Max 2 files total
  },
})

// CORS configuration for seller registration endpoint
const corsOptions = {
  origin: process.env.STORE_CORS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}

export default defineMiddlewares({
  routes: [
    {
      method: ["POST", "OPTIONS"],
      matcher: "/seller-registrations",
      middlewares: [
        cors(corsOptions),
        // @ts-ignore
        upload.fields([
          { name: "vat_registration_certificate", maxCount: 1 },
          { name: "updated_company_affidavit", maxCount: 1 },
        ]),
      ],
    },
  ],
})
