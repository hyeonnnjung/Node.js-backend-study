const DB = [];

function saveDB(user){
    const oldDBSize = DB.length + 1;
    DB.push(user);
    console.log(`save ${user.name} to DB`);
    return new Promise((resolve, reject) =>{
        if(DB.length > oldDBSize){
            resolve(user);
        }
        else{
            console.log("here");
            reject(new Error("Save DB Error!"));
        }
    });
}

function sendEmail(user){
    console.log(`email to ${user.email}`);
    return new Promise((resolve) =>{
        resolve(user);
    });
}

function getResult(user){
    return new Promise((resolve, rejext)=>{
        resolve(`success register ${user.name}`);
    });
}

function registerByPromise(user){
    const result = saveDB(user).catch(error => new Error(error)).then(sendEmail).then(getResult);
    console.log(result);
    return result;
}

const myUser = {email : "andy@test.com", password : "1234", name : "andy"};
const result = registerByPromise(myUser);
result.then(console.log);