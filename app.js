const express = require("express"); // express 불러오기
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // mongoose 불러오기
const Todo = require("./models/todo");  // Todo 모델 가져오기

mongoose.connect("mongodb://localhost/todo-demo", { // DB 에 연결하기
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); // DB 연결되지 않았을 때 경고 메세지 설정

const app = express();
const router = express.Router(); // router 생성

router.get("/", (req, res) => {
    res.send("Hi!");
});

// 할 일 목록 불러오기 API (경로명은 복수형을 권장: "/todos") => GET method 사용
router.get("/todos", async (req, res) => {
    const todos = await Todo.find().sort("-order").exec(); // DB에서 모든 정보 내림차순으로 가져오기 => exec method의 결과물은 promise라서 await을 써줘야한다???
    // 저장된 모든 할 일을 불러와야되기 때문에 findOne 이 아니라 그냥 find
    res.send({ todos });
});

// 할 일 추가하기 API => POST method 사용
router.post("/todos", async (req, res) => {
    const { value } = req.body; // 클라이언트에서 입력한 값을 body parser로 받아온다. (구조분해할당)
    const maxOrderTodo = await Todo.findOne().sort("-order").exec(); // order no.가 가장 높은 값 가져오기 (-order => 내림차순)
    let order = 1; // 아무것도 없는 경우: 기본값 1

    if (maxOrderTodo) { // order no.가 제일 높은 값이 있다면,
        order = maxOrderTodo.order + 1; // 가장 높은 order값에 +1을 해준다.
    }

    const todo = new Todo({ value, order }); // 값 저장
    await todo.save(); // save는 promise 이게 때문에 await 추가

    res.send({ todo }); // 응답 보내주기
});

// 저장한 할 일 일부수정 API => PATCH method 사용
router.patch("/todos/:todoId", async (req, res) => { // todoId 라는 parameter를 사용하기 위해 추가함.
    const { todoId } = req.params; // 고유 parameter 가져오기
    const { order, value, done } = req.body; // 입력받은 내용 가져와서 사용할 준비

    const todo = await Todo.findById(todoId).exec(); // 가져온 parameter들을 DB에서 꺼내오기

    if (order) { // order 데이터가 있는 경우
        const targetTodo = await Todo.findOne({ order }).exec(); // order 값을 가지고 있는 확인
        if (targetTodo) { // targetTodo가 있으면
            targetTodo.order = todo.order; // 순서 변경
            await targetTodo.save(); // 바뀐 순서 저장 => save는 promise니까 await 해줘야 된다.
        }
        // 1주차 숙제 >> 할 일 내용 수정 기능
        todo.order = order;
    } else if (value) { // 받은 데이터 중에 value가 있으면,
        todo.value = value; // 변경된 값으로 수정해준다.
    } else if (done !== undefined) {
        todo.doneAt = done ? new Date() : null; // 삼항연산자 >> if else 문으로도 표현가능
    }
    // 이 밑부분이 윗줄(doneAt)과 동일한 의미
    //     if (done) {
    //         todo.doneAt = new Date();
    //     } else {
    //         todo.doneAt = null;
    //     }
    // }
    // 1주차 숙제 끝

    await todo.save(); // 변경한 todo를 저장한다.

    res.send({}); // respond 안보내주면 클라이언트에서 기다리다가 error난다. 아무의미 없는 응답이어도 보내줘야함
});

// 1주차 숙제_2 >> 할 일 삭제 API
router.delete("/todos/:todoId", async (req, res) => {
    const { todoId } = req.params; // 클라이언트에서 보내주는 "삭제" 요청 받기

    const todo = await Todo.findById(todoId).exec(); // 삭제하기 위해서 DB에서 저장된 것 가져오기
    await todo.delete(); // 삭제하기

    res.send({}); // 요청에 빈 응답 객체 보내주기 => 이렇게 빈 응답이라도 보내줘야 정상 작동한다
});
// 1주차 숙제_2 끝

app.use("/api", bodyParser.json(), router);
app.use(express.static("./assets"));

app.listen(8080, () => {
    console.log("서버가 켜졌어요!");
});