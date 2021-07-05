const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Todo = require("./models/todo");  // Todo 모델 가져오기

mongoose.connect("mongodb://localhost/todo-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hi!");
});

router.get("/todos", async (req, res) => { // 목록 불러오기 API (경로명은 복수형을 권장)
  const todos = await Todo.find().sort("-order").exec(); // DB에서 모든 정보 내림차순으로 가져오기 => exec method의 결과물은 promise라서 await을 써줘야한다???

  res.send({ todos });
});

router.post("/todos", async (req, res) => { // 할 일 추가하기 API 
  const { value } = req.body; // 클라이언트에서 입력한 값을 body parser로 받아온다. (구조분해할당)
  const maxOrderTodo = await Todo.findOne().sort("-order").exec(); // order no.가 가장 높은 값 가져오기
  let order = 1; // 아무것도 없는 경우: 기본값은 1

  if (maxOrderTodo) {
    order = maxOrderTodo.order + 1; // 가장 높은 order값에 +1을 해준다
  }

  const todo = new Todo({ value, order }); // 값 저장
  await todo.save();

  res.send({ todo }); // 응답 보내주기
});

router.patch("/todos/:todoId", async (req, res) => { // 저장한 할 일 일부수정 API => PATCH method 사용
  const { todoId } = req.params; // 고유 파라미터 가져오기
  const { order, value, done } = req.body; // 입력받은 내용 가져와서 사용할 준비

  const todo = await Todo.findById(todoId).exec(); // DB에서 꺼내오기

  if (order) { // order 데이터가 있는 경우
    const targetTodo = await Todo.findOne({ order }).exec(); // order 값을 가지고 있는 확인
    if (targetTodo) { // targetTodo가 있으면
      targetTodo.order = todo.order; // 순서 변경
      await targetTodo.save(); // 바뀐 순서 저장 => save는 promise니까 await 해줘야된다??
    }
    // 1주차 숙제
    todo.order = order;
  } else if (value) { // 받은 데이터 중에 value가 있으면,
    todo.value = value; // 수정
  } else if (done !== undefined) {
    todo.doneAt = done ? new Date() : null; // 삼항연산자 >> if else 문으로도 표현가능
  }
    // 1주차 숙제 끝

  await todo.save(); // 변경한 todo를 저장한다.

  res.send({}); // respond 안보내주면 클라이언트에서 기다리다가 error난다. 아무의미 없는 응답이어도 보내줘야함
});

// 1주차 숙제
router.delete("/todos/:todoId", async (req, res) => { // 할 일 삭제하기 API
  const { todoId } = req.params; // 클라이언트에서 보내주는 "삭제" 요청 받기

  const todo = await Todo.findById(todoId).exec(); // 삭제하기 위해서 DB에서 저장된 것 가져오기
  await todo.delete(); // 삭제하기

  res.send({}); // 요청에 빈 응답 객체 보내주기 => 이렇게 빈 응답이라도 보내줘야 정상 작동한다
});
// 1주차 숙제 끝

app.use("/api", bodyParser.json(), router);
app.use(express.static("./assets"));

app.listen(8080, () => {
  console.log("서버가 켜졌어요!");
});