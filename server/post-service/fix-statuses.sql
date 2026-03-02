UPDATE posts."Link" l
SET status = CASE
  WHEN fc.verdict = 'VALIDATED' THEN 'VALIDATED'::"posts"."LinkStatus"
  WHEN fc.verdict = 'DEBUNKED'  THEN 'DEBUNKED'::"posts"."LinkStatus"
END
FROM (
  SELECT DISTINCT ON ("postId") "postId", verdict
  FROM posts."FactCheck"
  ORDER BY "postId", "createdAt" DESC
) fc
WHERE l.id = fc."postId"
  AND l.status IN ('PENDING', 'UNDER_REVIEW')
  AND l."deletedAt" IS NULL;
