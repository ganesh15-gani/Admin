async function main() {
  const adminRes = await fetch('https://stayzen-admin-api.onrender.com/api/admins');
  console.log("Admins status:", adminRes.status);
}
main();
