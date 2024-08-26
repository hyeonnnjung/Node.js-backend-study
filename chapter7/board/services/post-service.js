const { update } = require("lodash");
const paginator = require("../utils/paginator");
const { ObjectId } = require("mongodb");


//글쓰기
async function writePost(collection, post){
    //생성일시와 조회수를 넣어줌
    post.hits = 0;
    post.createdDt = new Date().toISOString();
    return await collection.insertOne(post); //몽고디비에 post 저장
}


//글목록
async function list(collection, page, search){
    const perPage = 10;

    //title이 search와 일치하는지 확인 : 정규표현식
    const query = {title : new RegExp(search, "i")};

    //limit : 10개만 가져온다는 의미
    //skip : 설정된 개수만큼 컨너뛴다는 뜻
    //생성일 역순으로 정렬 : 최근꺼부터
    const cursor = collection.find(query, {limit : perPage, skip : (page - 1) * perPage}).sort({
        createdDt : -1,
    });

    //검색어에 걸리는 게시물의 총 개수
    const totalCount = await collection.count(query);
    const posts = await cursor.toArray(); //커서로 받아온 데이터를 리스트로 변경

    //페이지네이터 생성
    const paginatorObj = paginator({totalCount, page, perPage});
    
    return [posts, paginatorObj];
}


//게시글 가져오기
//패스워드는 노출할 필요가 없으므로 결과값으로 가져오지 않음
const projectionOption = {
    //결과값에서 일부만 가져올 때 사용
    projection : {
        password : 0,
        "comments.password" : 0,
    },
};

async function getDetailPost(collection, id){
    //게시글을 읽을 때마다 hits += 1
    return await collection.findOneAndUpdate({_id : ObjectId(id)}, {$inc : {hits : 1}}, projectionOption);
}


//id와 password로 게시글 데이터 가져오기
async function getPostByIdAndPassword(collectio, {id, password}){
    return await collection.findOne({ _id : ObjectId(id), password : password}, projectionOption);
}

async function getPostById(collection, id) {
    return await collection.findOne({ _id: ObjectId(id) }, projectionOption);
}

//게시글 수정
async function updatePost(collection, id, post){
    const toUpdatePost = {
        $set : {
            ...post,
        },
    };
    return await collection.updateOne({_id : ObjectId(id)}, toUpdatePost);
}

module.exports = {
    //require()로 파일을 임포트 시 외부로 노출하는 객체들을 모아두는 것
    writePost,
    list,
    getDetailPost,
    getPostByIdAndPassword,
    getPostById,
    updatePost,
};