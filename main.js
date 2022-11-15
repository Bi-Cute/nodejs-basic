var http = require('http');
//fs = file Sysyem
var fs = require('fs');
// require = 모듈을 가져와서 사용한다는 것을 선언
var url = require('url');
const qs = require('querystring');

function templateHTML(title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
    </head> 
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `;
}

function templateList(files) {
    var list = '<ul>';
    var i = 0;
    while (i < files.length) {
        list = list + `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
        i++;
    }
    list = list + '</ul>';
    return list;
}

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathName = url.parse(_url, true).pathname;

    console.log(url.parse(_url, true));

    if (pathName === '/') {
        // 쿼리가 없다면 = 홈페이지라면
        if (queryData.id === undefined) {
            fs.readdir('./data', (error, files) => {
                var title = 'welcome';
                var description = 'hello, Node.js';
                var list = templateList(files);
                var template = templateHTML(
                    title,
                    list,
                    `<h2>${title}</h2>
                    <p>${description}</p>`,
                    `<a href="/create">create</a>`,
                );
                response.writeHead(200); // 200 = 성공
                response.end(template); // 화면에 보여줄 내용
            });
        } else {
            fs.readdir('./data', (error, files) => {
                fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = queryData.id;
                    var list = templateList(files);
                    var template = templateHTML(
                        title,
                        list,
                        `<h2>${title}</h2> <p>${description}</p>`,
                        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>
                        <form action="delete_process" method="post" ">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                        </form>`,
                    );
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else if (pathName === '/create') {
        fs.readdir('./data', (error, files) => {
            var title = 'WEB - create';
            var list = templateList(files);
            var template = templateHTML(
                title,
                list,
                ` 
                <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit"></p>
                </form>
                `,
                '',
            );
            response.writeHead(200);
            response.end(template);
        });
    } else if (pathName === '/create_process') {
        var body = '';
        // 웹브라우저가
        request.on('data', function (data) {
            body = body + data;
            if (body.length > 1e6) {
                request.connection.destroy();
            }
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            // 파일 생성
            fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
                if (err) throw err;
                response.writeHead(302, { Location: `?id=${title}` }); // 302 = 페이지 리다이렉션
                response.end();
            });
        });
    } else if (pathName === '/update') {
        fs.readdir('./data', (error, files) => {
            fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                var title = queryData.id;
                var list = templateList(files);
                var template = templateHTML(
                    title,
                    list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}" >
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p><textarea name="description" placeholder="description" >${description}</textarea></p>
                        <p><input type="submit"></p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`,
                );
                response.writeHead(200);
                response.end(template);
            });
        });
    } else if (pathName === '/update_process') {
        var body = '';
        // 웹브라우저가
        request.on('data', function (data) {
            body = body + data;
            if (body.length > 1e6) {
                request.connection.destroy();
            }
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, error => {
                fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
                    if (err) throw err;
                    response.writeHead(302, { Location: `?id=${title}` }); // 302 = 페이지 리다이렉션
                    response.end();
                });
            });
        });
    } else if (pathName === '/delete_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
            if (body.length > 1e6) {
                request.connection.destroy();
            }
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, error => {
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else {
        response.writeHead(404); // 404 = 파일을 찾을수 없음
        response.end('Not Found');
    }
});

app.listen(3000);
