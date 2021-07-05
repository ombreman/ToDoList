const mongoose = require("mongoose"); // mongoose 불러오기

const TodoSchema = new mongoose.Schema({
  value: String,
  doneAt: Date, // 할일 체크한 시간 점검하는 스키마 항목
  order: Number // 처음 추가하는 것은 order가 1, 누적될수록 2, 3, 4 ...
});

TodoSchema.virtual("todoId").get(function () { // 몽구스 자체 문법
  return this._id.toHexString();
});
TodoSchema.set("toJSON", {
  virtuals: true
});

module.exports = mongoose.model("Todo", TodoSchema); // model을 module화 해서 내보내기