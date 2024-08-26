const lodash = require("lodash");
const PAGE_LIST_SIZE = 10; //최대 몇개의 페이지를 보여줄지 설정

module.exports = ({totalCount, page, perPage = 10}) =>{
    const PER_PAGE = perPage;
    const totalPage = Math.ceil(totalCount / PER_PAGE);

    //시작 페이지 구하기 : 1~10 / 11~20 / 21 ~ 30... 이런 식으로!
    let quotient = parseInt(page / PAGE_LIST_SIZE);
    if(page % PAGE_LIST_SIZE === 0){
        quotient -= 1;
    }
    const startPage = quotient * PAGE_LIST_SIZE + 1;

    //끝 페이지 구하기
    const endPage = startPage + PAGE_LIST_SIZE - 1 < totalPage ? startPage + PAGE_LIST_SIZE - 1 : totalPage;

    const isFirstPage = page === 1;
    const isLastPage = page === totalPage;
    const hasPrev = page > 1;
    const hasNext = page < totalPage;

    const paginator = {
        //표시할 페이지 번호 리스트를 만들어줌
        pageList : lodash.range(startPage, endPage + 1),
        page,
        prevPage : page - 1,
        nextPage : page + 1,
        startPage,
        lastPage : totalPage,
        hasPrev,
        hasNext,
        isFirstPage,
        isLastPage,
    };
    return paginator;
};