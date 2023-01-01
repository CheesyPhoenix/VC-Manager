import fs from "fs";
import { spawn } from "child_process";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8")) as {
	version: string;
};

pkg.version = (parseInt(pkg.version) + 1).toString();

fs.writeFileSync("./package.json", JSON.stringify(pkg, null, "\t") + "\n");

const version = parseInt(pkg.version);

const build = spawn(
	"docker",
	`buildx build -t docker.cheesyphoenix.tk/cheesyphoenix/vc-manager:latest -t docker.cheesyphoenix.tk/cheesyphoenix/vc-manager:${version} --push .`.split(
		" "
	)
);

build.stdout.on("data", (data) => {
	console.log(`${data}`);
});

build.stderr.on("data", (data) => {
	console.log(`${data}`);
});

build.on("error", (error) => {
	console.error(error.message);
});

build.on("close", (code) => {
	console.log(`child process exited with code ${code}`);
});
