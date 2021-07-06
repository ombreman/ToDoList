// mongoose 공식문서 참고
const mongoose = require("mongoose"); // mongoose 불러오기

const TodoSchema = new mongoose.Schema({ // Schema 정의 >> Schema는 class라서 new 붙여줘야함
    // 프론트앤드에서 이미 정의돼있는 항목들임
    // todoId: String, => 이렇게 해도됨
    value: String, // 할 일 항목이기 때문에 string으로 입력받음
    doneAt: Date, // 할 일 체크한 시간 점검하는 스키마 항목 >> 체크를 언제 했는지 알 수 있음
    order: Number // 처음 추가하는 것은 order가 1, 누적될수록 2, 3, 4 ...
});

// todoId 가 있어야 정상 동작하는데, 매번 추가하기보다 moongoose 자체기능(virtual schema) 활용한다.
TodoSchema.virtual("todoId").get(function () { // virtual schema (mongoose 자체 문법)
    return this._id.toHexString();
});

TodoSchema.set("toJSON", { // toJSON 설정도 변경해줘야함, todo model 이 JSON 형태로 변화될 때 virtual schema를 포함한다라는 뜻 >> 자세한 내용은 공식문서 참조
    virtuals: true
});

module.exports = mongoose.model("Todo", TodoSchema); // model을 module화 해서 내보내기