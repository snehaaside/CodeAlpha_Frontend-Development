(function () {
  var MAX = 15;
  var SYM = { "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%" };
  var cur = "0", prev = null, op = null, fresh = false, expr = "", err = false;
  var elVal = document.getElementById("value");
  var elExpr = document.getElementById("expr");

  function fmt(n) { return parseFloat(n.toPrecision(12)).toString(); }
  function group(s) {
    if (err || s.indexOf("e") > -1) return s;
    var neg = s.charAt(0) === "-"; if (neg) s = s.slice(1);
    var parts = s.split("."), out = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts.length > 1) out += "." + parts[1];
    return (neg ? "-" : "") + out;
  }
  function decimals(x) {
    var s = String(x);
    if (s.indexOf("e") > -1) return 0;
    var i = s.indexOf(".");
    return i < 0 ? 0 : s.length - i - 1;
  }
  function compute(a, o, b) {
    switch (o) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? NaN : a / b;
      case "%":
        if (b === 0) return NaN;
        var m = Math.pow(10, Math.max(decimals(a), decimals(b)));
        return (Math.round(a * m) % Math.round(b * m)) / m;
    }
  }
  function render() {
    var t = group(cur);
    elVal.textContent = t;
    elExpr.textContent = expr || "\u00a0";
    var n = t.length;
    elVal.style.fontSize = n > 14 ? "1.6rem" : n > 11 ? "2rem" : n > 8 ? "2.5rem" : "3rem";
  }
  function reset() { cur = "0"; prev = null; op = null; fresh = false; expr = ""; err = false; }
  function fail() {
    cur = "Error"; err = true; prev = null; op = null; fresh = true;
    expr = "Can’t divide by zero"; render();
  }

  function digit(d) {
    if (err) reset();
    if (fresh) { cur = "0"; fresh = false; if (!op) expr = ""; }
    if (cur === "0") cur = d;
    else if (cur === "-0") cur = "-" + d;
    else if (cur.replace(/[-.]/g, "").length < MAX) cur += d;
    render();
  }
  function dot() {
    if (err) reset();
    if (fresh) { cur = "0"; fresh = false; if (!op) expr = ""; }
    if (cur.indexOf(".") === -1) cur += ".";
    render();
  }
  function operator(o) {
    if (err) return;
    if (op && !fresh) {
      var r = compute(prev, op, parseFloat(cur));
      if (!isFinite(r)) return fail();
      prev = r; cur = fmt(r);
    } else {
      prev = parseFloat(cur);
    }
    op = o; fresh = true;
    expr = group(fmt(prev)) + " " + SYM[o];
    render();
  }
  function equals() {
    if (err || op === null) return;
    var b = parseFloat(cur), r = compute(prev, op, b);
    if (!isFinite(r)) return fail();
    expr = group(fmt(prev)) + " " + SYM[op] + " " + group(fmt(b)) + " =";
    cur = fmt(r); prev = null; op = null; fresh = true;
    render();
  }
  function negate() {
    if (err) return;
    if (fresh && op) { cur = "-0"; fresh = false; }
    else cur = cur.charAt(0) === "-" ? cur.slice(1) : "-" + cur;
    render();
  }
  function back() {
    if (err) { reset(); return render(); }
    if (fresh) return;
    cur = cur.slice(0, -1);
    if (cur === "" || cur === "-" || cur === "-0") cur = "0";
    render();
  }
  function clearAll() { reset(); render(); }

  function run(a, v) {
    if (a === "digit") digit(v);
    else if (a === "dot") dot();
    else if (a === "op") operator(v);
    else if (a === "eq") equals();
    else if (a === "neg") negate();
    else if (a === "back") back();
    else if (a === "clear") clearAll();
  }

  document.getElementById("keys").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) run(b.dataset.a, b.dataset.v);
  });

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key, a = null, v = null;
    if (/^[0-9]$/.test(k)) { a = "digit"; v = k; }
    else if (k === "." || k === ",") { a = "dot"; k = "."; }
    else if (k === "+" || k === "-" || k === "*" || k === "/" || k === "%") { a = "op"; v = k; }
    else if (k === "Enter" || k === "=") { a = "eq"; k = "Enter"; }
    else if (k === "Backspace") a = "back";
    else if (k === "Escape" || k === "Delete") { a = "clear"; k = "Escape"; }
    if (!a) return;
    e.preventDefault();
    run(a, v);
    var btn = document.querySelector('[data-key="' + k + '"]');
    if (btn) { btn.classList.add("press"); setTimeout(function () { btn.classList.remove("press"); }, 120); }
  });

  render();
})();
