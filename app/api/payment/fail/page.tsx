export default async function FailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return (
    <pre style={{ color: "white" }}>{JSON.stringify(params, null, 2)}</pre>
  );
}
