export function catalogTabsForNav(tabs = []) {
  return tabs.filter(
    (tab) => tab?.status !== "inactive" && (tab?.postCount || 0) > 0
  );
}

export function postCover(post) {
  if (!post) return "";
  if (post.mediaType === "youtube") {
    return post.thumbnail || "";
  }
  return post.image || post.thumbnail || "";
}

export function downloadCsv(filename, rows, headers) {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.map((h) => escape(h.label)).join(","),
    ...rows.map((row) =>
      headers.map((h) => escape(row[h.key])).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
