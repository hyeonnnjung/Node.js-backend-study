const express = require("express");
const handlebars = require("express-handlebars");

const app = express();
//req.body와 POST 요청을 해석하기 위한 설정
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//몽고디비 연결 함수
const mongodbConnection = require("./configs/mongodb-connection");
const { mongo } = require("mongoose");

const postService = require("./services/post-service"); //서비스 파일 로딩

//app.engine("handlebars", handlebars.engine()); //템플릿 엔진으로 핸들바 등록 | 파일 확장자로 handlebars 사용하겠다는 뜻

//handlebars.create() 함수는 handlebars 객체를 만들 때 사용 | 옵션으로 헬퍼 함수 추가
app.engine(
    "handlebars", 
    handlebars.create({
        helpers : require("./configs/handlebars-helpers"),
    }).engine, //핸들바 생성 및 엔진 반환 : handlebars 객체에 있는 engine을 설정
);
app.set("view engine", "handlebars"); //웹페이지 로드 시 사용할 템플릿 엔진 설정
app.set("views", __dirname + "/views"); //뷰 디렉토리를 views로 설정 | __dirname = node를 실행하는 디렉터리 경로

//라우터 설정
//home이 템플릿 파일의 이름 -> views/home.handlebars 파일에 데이터를 렌더링
//렌더링할 때 title과 message값이 객체로 들어가게됨

//리스트 페이지
app.get("/", async (req, res) =>{
    const page = parseInt(req.query.page) || 1; //get으로 API를 호출해서 URL 뒤에 변수를 추가하면 req.qurey 객체로 변수값을 받아올 수 있음
    const search = req.query.search || "";
    try{
        //postService.list에서 글 목록과 페이지네이터를 가져옴
        const [posts, paginator] = await postService.list(collection, page, search);

        //리스트 페이지 렌더링
        res.render("home", {title : "테스트 게시판", search, paginator, posts});
    } catch(error){
        console.log(error);
        //에러가 나는 경우 빈값으로 렌더링
        res.render("home", {title : "테스트 게시판"});
    }
});

app.get("/write", (req, res)=>{
    res.render("write", {title : "테스트 게시판", mode : "create"});
});

app.post("/write", async(req, res) =>{
    const post = req.body;
    const result = await postService.writePost(collection, post);
    res.redirect(`/detail/${result.insertedId}`);
});

//데이터베이스를 조회하는 것은 비동기적으로!
//상세페이지로 이동
app.get("/detail/:id", async (req, res) => {
    //게시글 정보 가져오기
    const result = await postService.getDetailPost(collection, req.params.id);
    res.render("detail", {
        title : "테스트 게시판",
        post : result.value,
    });
});

//패스워드 체크
app.post("/check-password", async (req, res) =>{
    const {id, password} = req.body;

    const post = await postService.getPostByIdAndPassword(collection, {id, password});

    if(!post){
        return res.status(404).json({ isExist : false});
    } else{
        return res.json({ isExist : true});
    }
});


//수정 페이지로 이동
app.get("/modify/:id", async(req, res) =>{
    const {id} = req.params.id;
    const post = await postService.getPostById(collection, req.params.id);
    console.log(post);
    res.render("write", {title : "테스트 게시판", mode : "modify", post});
});

//게시글 수정 API
app.post("/modify/", async (req, res)=>{
    const {id, title, writer, password, content} = req.body;

    const post = {
        title,
        writer,
        password,
        content,
        createdDt : new Date().toISOString(),
    };

    const result = postService.updatePost(collection, id, post);
    res.redirect(`/detail/${id}`);
})


//게시글 삭제
app.delete("/delte", async (req, res)=>{
    const {id, password } = req.body;

    try{
        const result = await collection.deleteOne({_id : ObjectId(id), password : password});
        if(result.deletedCount !== 1){
            console.log("삭제 실패");
            return res.json({isSuccess : false});
        }
        return res.json({isSuccess : true});
    } catch(error){
        console.error(error);
        return res.json({isSuccess : false});
    }
});


//댓글 추가
app.post("/write-comment", async (req, res) =>{
    const {id, name, password, comment } = req.body;
    const post = await postService.getPostById(collection, id);
    //console.log(id);
    //console.log(post);

    // 게시글에 기존 댓글 리스트가 있으면 추가
    if (post.comments) {
        post.comments.push({
            idx: post.comments.length + 1,
            name,
            password,
            comment,
            createdDt: new Date().toISOString(),
        });
        //console.log('here');
    } else {
        // 게시글에 댓글 정보가 없으면 리스트에 댓글 정보 추가
        post.comments = [
            {
                idx: 1,
                name,
                password,
                comment,
                createdDt: new Date().toISOString(),
            },
        ];
    }
    postService.updatePost(collection, id, post);
    return res.redirect(`/detail/${id}`);
})


//댓글 삭제
app.delete("/delete-comment", async(req, res) =>{
    const {id, idx, password} = req.body;

    const post = await collection.findOne(
        {
            _id : ObjectId(id),
            comments : {$elemMatch : {idx : parseInt(idx), password}},
        },
        postService.projectionOption,
    );

    if(!post){
        return res.json({isSuccess : false});
    }

    //댓글 번호가 idx 이외인 것만 comments에 다시 할당 후 저장
    post.comment = post.comments.filter((comment) => comment.idx != idx);
    postService.updatePost(collection, id, post);
    return res.json({isSuccess : true});
})

let collection;
app.listen(3000, async()=>{
    console.log("Server started");

    //mongodbConnection()의 결과는 mongoClient
    const mongoClient = await mongodbConnection();

    //mongoClient.db로 디비 접근 -> collection()으로 컬렉션 선택 -> collection 변수에 할당
    collection = mongoClient.db().collection("post");
    console.log("MongoDB connected");
});