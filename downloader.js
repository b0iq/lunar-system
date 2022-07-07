var fs = require("fs"),
  request = require("request");

var download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    console.log("content-type:", res.headers["content-type"]);
    console.log("content-length:", res.headers["content-length"]);

    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
};

async function program() {
  for (let i = 0; i <= 62; i++) {
    download(
      `https://positiveprints.com/generator/moon/assets/moon/moon_shadow/${i}.png`,
      `moons/${i}.png`,
      function () {
        console.log("done", i);
      }
    );
  }
}

program();
