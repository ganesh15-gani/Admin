async function main() {
  console.log("Checking /api/roles...");
  const rolesRes = await fetch('https://stayzen-admin-api.onrender.com/api/roles');
  console.log("Roles status:", rolesRes.status);
}
main();
