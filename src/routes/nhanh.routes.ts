import { Router } from "express";
import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const router = Router();

/**
 * GET /nhanh/connect
 * Redirects to Nhanh.vn OAuth login page.
 * Visit this URL in your browser to start the OAuth flow.
 */
router.get("/nhanh/connect", (req, res) => {
  if (!env.NHANH_APP_ID) {
    res.status(400).send("NHANH_APP_ID is not configured");
    return;
  }

  const returnLink = `${req.protocol}://${req.get("host")}/nhanh/callback`;
  const authUrl =
    `https://nhanh.vn/oauth?version=2.0&appId=${env.NHANH_APP_ID}&returnLink=${encodeURIComponent(returnLink)}`;

  res.redirect(authUrl);
});

/**
 * GET /nhanh/callback
 * Receives the accessCode from Nhanh.vn after user authorizes.
 * Exchanges it for an accessToken.
 */
router.get("/nhanh/callback", async (req, res) => {
  const accessCode = req.query.accessCode as string;

  if (!accessCode) {
    res.status(400).send("No accessCode received from Nhanh.vn");
    return;
  }

  try {
    const response = await axios.post(
      `https://pos.open.nhanh.vn/v3.0/app/getaccesstoken?appId=${env.NHANH_APP_ID}`,
      {
        accessCode,
        secretKey: env.NHANH_SECRET_KEY,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = response.data;

    if (data.code === 1) {
      logger.info("Nhanh.vn access token obtained successfully");
      res.send(
        `<h2>Nhanh.vn Connected!</h2>
        <p>Set these in your Railway environment variables:</p>
        <pre>NHANH_ACCESS_TOKEN=${data.data.accessToken}
NHANH_BUSINESS_ID=${data.data.businessId}</pre>
        <p>Token expires at: ${new Date(data.data.expiredAt * 1000).toISOString()}</p>`
      );
    } else {
      logger.error({ data }, "Failed to get Nhanh.vn access token");
      res.status(400).send(`<h2>Error</h2><pre>${JSON.stringify(data, null, 2)}</pre>`);
    }
  } catch (error: any) {
    logger.error({ error: error.message }, "Nhanh.vn token exchange failed");
    res.status(500).send(`<h2>Error</h2><pre>${error.message}</pre>`);
  }
});

export default router;
