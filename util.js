module.exports.alertLocation = (obj) => {
  const html = `<meta charset="utf-8">
                <script>
                  alert("${obj.msg}");
                  location.href = "${obj.loc}";
                </script>`;
  console.log(html);
  return html;
};