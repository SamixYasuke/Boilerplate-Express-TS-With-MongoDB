import { CustomError } from "@/errors/CustomError";
import { Router, type Request, type Response } from "express";
import fs from "fs/promises";
import path from "path";

const logRouter = Router();

const LOG_FILE_PATH = path.join(__dirname, "../../app.log");

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

const parseLogEntries = (logContent: string): LogEntry[] => {
  const entries: LogEntry[] = [];
  const lines = logContent.split("\n").filter((line) => line.trim() !== "");

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.timestamp && parsed.level && parsed.message) {
        entries.push(parsed);
      }
    } catch (error) {
      entries.push({
        timestamp: new Date().toISOString(),
        level: "error",
        message: `Malformed log entry: ${line}`,
      });
    }
  }
  return entries;
};

const generateLogHtml = (
  entries: LogEntry[],
  levelFilter?: string,
  limit?: number,
  page: number = 1,
  entriesPerPage: number = 10
): string => {
  let filteredEntries = entries;

  if (levelFilter) {
    filteredEntries = entries.filter(
      (entry) => entry.level.toLowerCase() === levelFilter.toLowerCase()
    );
  }

  filteredEntries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalEntries = filteredEntries.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedEntries = limit
    ? filteredEntries.slice(0, limit)
    : filteredEntries.slice(startIndex, startIndex + entriesPerPage);

  const getPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (levelFilter) params.set("level", levelFilter);
    if (limit) params.set("limit", limit.toString());
    params.set("page", pageNum.toString());
    return `/api/logs?${params.toString()}`;
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Logs</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          padding: 24px;
          background-color: #f5f7fa;
          margin: 0;
          color: #1a202c;
        }
        .log-container {
          max-width: 1440px;
          margin: 0 auto;
          background: #ffffff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
        }
        h1 {
          color: #1a202c;
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.9rem;
        }
        th, td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
        }
        th:first-child {
          border-top-left-radius: 8px;
        }
        th:last-child {
          border-top-right-radius: 8px;
        }
        tr {
          transition: background-color 0.2s ease;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        tr:hover {
          background-color: #edf2f7;
        }
        .log-level-info { color: #10b981; font-weight: 500; }
        .log-level-error { color: #ef4444; font-weight: 500; }
        .log-level-warn { color: #f59e0b; font-weight: 500; }
        .log-level-debug { color: #6b7280; font-weight: 500; }
        .metadata {
          font-family: 'Fira Code', monospace;
          font-size: 0.85rem;
          background-color: #f1f5f9;
          padding: 10px;
          border-radius: 6px;
          white-space: pre-wrap;
          max-width: 400px;
        }
        .pagination {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pagination a {
          padding: 10px 16px;
          text-decoration: none;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .pagination a:hover {
          background-color: #3b82f6;
          color: white;
          transform: translateY(-2px);
        }
        .pagination a.disabled {
          color: #d1d5db;
          border-color: #d1d5db;
          pointer-events: none;
          opacity: 0.6;
        }
        .pagination a.active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          table {
            font-size: 0.8rem;
          }
          th, td {
            padding: 10px 12px;
          }
          .log-container {
            padding: 16px;
          }
          .pagination {
            gap: 8px;
          }
          .pagination a {
            padding: 8px 12px;
          }
        }
      </style>
    </head>
    <body>
      <div class="log-container">
        <h1>Application Logs</h1>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Message</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            ${paginatedEntries
              .map(
                (entry) => `
                  <tr>
                    <td>${entry.timestamp}</td>
                    <td class="log-level-${entry.level.toLowerCase()}">${
                  entry.level
                }</td>
                    <td>${entry.message}</td>
                    <td class="metadata">${
                      Object.keys(entry).filter(
                        (key) =>
                          !["timestamp", "level", "message"].includes(key)
                      ).length > 0
                        ? `<pre>${JSON.stringify(
                            Object.fromEntries(
                              Object.entries(entry).filter(
                                ([key]) =>
                                  !["timestamp", "level", "message"].includes(
                                    key
                                  )
                              )
                            ),
                            null,
                            2
                          )}</pre>`
                        : "-"
                    }</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
        <div class="pagination">
          <a href="${getPaginationUrl(currentPage - 1)}" class="${
    currentPage === 1 ? "disabled" : ""
  }">Previous</a>
          ${Array.from({ length: totalPages }, (_, i) => i + 1)
            .map(
              (pageNum) => `
                <a href="${getPaginationUrl(pageNum)}" class="${
                pageNum === currentPage ? "active" : ""
              }">${pageNum}</a>
              `
            )
            .join("")}
          <a href="${getPaginationUrl(currentPage + 1)}" class="${
    currentPage === totalPages ? "disabled" : ""
  }">Next</a>
        </div>
      </div>
    </body>
    </html>
  `;
};

logRouter.get("/", async (req: Request, res: Response) => {
  try {
    await fs.access(LOG_FILE_PATH);
    const logContent = await fs.readFile(LOG_FILE_PATH, "utf8");

    const levelFilter = req.query.level as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

    const logEntries = parseLogEntries(logContent);

    const formattedContent = generateLogHtml(
      logEntries,
      levelFilter,
      limit,
      page
    );

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(formattedContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new CustomError("Log file not found", 404);
    }
    throw new CustomError(`Failed to read log file: ${error.message}`, 500);
  }
});

export default logRouter;
