async function myName(){
    return "Andy";
}

async function showName(){
    const name = await myName();
    console.log(name);
}

console.log(showName());