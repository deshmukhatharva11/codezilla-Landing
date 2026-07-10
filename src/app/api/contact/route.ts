import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const sheetData = {
      timestamp,
      name,
      email,
      phone: phone || "Not provided",
      message,
    };

    // If the user configured an Excel/Google Sheet Webhook (e.g. Google Apps Script, SheetDB, Zapier, Make)
    const rawWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;

    if (rawWebhookUrl) {
      try {
        // Clean any accidental extra equals signs or quotes around the URL from .env parsing
        const sheetWebhookUrl = rawWebhookUrl.replace(/^=+/, "").replace(/^"+|"+$/g, "").trim();

        console.log("Sending contact submission to Sheet Webhook:", sheetWebhookUrl);

        const response = await fetch(sheetWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sheetData),
          redirect: "follow", // Crucial: Google Apps Script returns a 302 redirect after appending to sheet
        });

        const responseText = await response.text();
        console.log("Sheet Webhook Response Status:", response.status, responseText);
      } catch (webhookError) {
        console.error("Error sending to Sheet Webhook:", webhookError);
        // Continue to return success to the user even if external webhook timeouts
      }
    } else {
      // Log for immediate development inspection or backup when env URL is not set
      console.log("=== NEW CONTACT SUBMISSION (READY FOR EXCEL/SHEET) ===");
      console.log(JSON.stringify(sheetData, null, 2));
      console.log("======================================================");
    }

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been sent directly to our contact spreadsheet.",
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
