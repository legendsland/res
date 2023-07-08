"use strict";
exports.id = "src_node_cli_db_ts";
exports.ids = ["src_node_cli_db_ts"];
exports.modules = {

/***/ "./src/node/cli/db.ts":
/*!****************************!*\
  !*** ./src/node/cli/db.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDb: () => (/* binding */ getDb)
/* harmony export */ });
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _common_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/util */ "./src/node/common/util.ts");
/* harmony import */ var _server_res__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../server/res */ "./src/node/server/res/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



const dbPath = path__WEBPACK_IMPORTED_MODULE_0__.join(_common_util__WEBPACK_IMPORTED_MODULE_1__.ROOT, 'src/common/db.json');
const getDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = new _server_res__WEBPACK_IMPORTED_MODULE_2__.NodeDb(dbPath);
    yield db.load();
    const anns = db.db.annotation;
    const addTags = () => {
        anns.records.forEach((record) => {
            record.notes.forEach(n => {
                if (n.tags === undefined) {
                    n.tags = [];
                }
            });
        });
        db.save();
    };
    const addPos = () => {
        anns.records.forEach((record) => {
            record.notes.forEach(n => {
                if (n.pos === undefined) {
                    n.pos = { top: 0, left: 0 };
                }
            });
        });
        db.save();
    };
    return {
        db: db,
    };
});


/***/ }),

/***/ "./src/node/common/util.ts":
/*!*********************************!*\
  !*** ./src/node/common/util.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ROOT: () => (/* binding */ ROOT)
/* harmony export */ });
const ROOT = '/home/zy/ws/res';


/***/ })

};
;
//# sourceMappingURL=src_node_cli_db_ts.js.map