/*
 @license
 Shaka Player
 Copyright 2016 Google LLC
 SPDX-License-Identifier: Apache-2.0
*/
(function() {
    var innerGlobal = typeof window != "undefined" ? window : global;
    var exportTo = {};
    (function(window, global, module) {
        var $jscomp = $jscomp || {};
        $jscomp.scope = {};
        $jscomp.ASSUME_ES5 = !1;
        $jscomp.ASSUME_NO_NATIVE_MAP = !1;
        $jscomp.ASSUME_NO_NATIVE_SET = !1;
        $jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
            a != Array.prototype && a != Object.prototype && (a[b] = c.value)
        };
        $jscomp.getGlobal = function(a) {
            return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a
        };
        $jscomp.global = $jscomp.getGlobal(this);
        $jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
        $jscomp.initSymbol = function() {
            $jscomp.initSymbol = function() {};
            $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol)
        };
        $jscomp.Symbol = function() {
            var a = 0;
            return function(b) {
                return $jscomp.SYMBOL_PREFIX + (b || "") + a++
            }
        }();
        $jscomp.initSymbolIterator = function() {
            $jscomp.initSymbol();
            var a = $jscomp.global.Symbol.iterator;
            a || (a = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
            "function" != typeof Array.prototype[a] && $jscomp.defineProperty(Array.prototype, a, {
                configurable: !0,
                writable: !0,
                value: function() {
                    return $jscomp.arrayIterator(this)
                }
            });
            $jscomp.initSymbolIterator = function() {}
        };
        $jscomp.arrayIterator = function(a) {
            var b = 0;
            return $jscomp.iteratorPrototype(function() {
                return b < a.length ? {
                    done: !1,
                    value: a[b++]
                } : {
                    done: !0
                }
            })
        };
        $jscomp.iteratorPrototype = function(a) {
            $jscomp.initSymbolIterator();
            a = {
                next: a
            };
            a[$jscomp.global.Symbol.iterator] = function() {
                return this
            };
            return a
        };
        $jscomp.makeIterator = function(a) {
            $jscomp.initSymbolIterator();
            var b = a[Symbol.iterator];
            return b ? b.call(a) : $jscomp.arrayIterator(a)
        };
        $jscomp.polyfill = function(a, b, c, d) {
            if (b) {
                c = $jscomp.global;
                a = a.split(".");
                for (d = 0; d < a.length - 1; d++) {
                    var e = a[d];
                    e in c || (c[e] = {});
                    c = c[e]
                }
                a = a[a.length - 1];
                d = c[a];
                b = b(d);
                b != d && null != b && $jscomp.defineProperty(c, a, {
                    configurable: !0,
                    writable: !0,
                    value: b
                })
            }
        };
        $jscomp.FORCE_POLYFILL_PROMISE = !1;
        $jscomp.polyfill("Promise", function(a) {
            function b() {
                this.batch_ = null
            }

            function c(a) {
                return a instanceof e ? a : new e(function(b, c) {
                    b(a)
                })
            }
            if (a && !$jscomp.FORCE_POLYFILL_PROMISE) return a;
            b.prototype.asyncExecute = function(a) {
                null == this.batch_ && (this.batch_ = [], this.asyncExecuteBatch_());
                this.batch_.push(a);
                return this
            };
            b.prototype.asyncExecuteBatch_ = function() {
                var a = this;
                this.asyncExecuteFunction(function() {
                    a.executeBatch_()
                })
            };
            var d = $jscomp.global.setTimeout;
            b.prototype.asyncExecuteFunction = function(a) {
                d(a,
                    0)
            };
            b.prototype.executeBatch_ = function() {
                for (; this.batch_ && this.batch_.length;) {
                    var a = this.batch_;
                    this.batch_ = [];
                    for (var b = 0; b < a.length; ++b) {
                        var c = a[b];
                        a[b] = null;
                        try {
                            c()
                        } catch (l) {
                            this.asyncThrow_(l)
                        }
                    }
                }
                this.batch_ = null
            };
            b.prototype.asyncThrow_ = function(a) {
                this.asyncExecuteFunction(function() {
                    throw a;
                })
            };
            var e = function(a) {
                this.state_ = 0;
                this.result_ = void 0;
                this.onSettledCallbacks_ = [];
                var b = this.createResolveAndReject_();
                try {
                    a(b.resolve, b.reject)
                } catch (k) {
                    b.reject(k)
                }
            };
            e.prototype.createResolveAndReject_ =
                function() {
                    function a(a) {
                        return function(d) {
                            c || (c = !0, a.call(b, d))
                        }
                    }
                    var b = this,
                        c = !1;
                    return {
                        resolve: a(this.resolveTo_),
                        reject: a(this.reject_)
                    }
                };
            e.prototype.resolveTo_ = function(a) {
                if (a === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
                else if (a instanceof e) this.settleSameAsPromise_(a);
                else {
                    a: switch (typeof a) {
                        case "object":
                            var b = null != a;
                            break a;
                        case "function":
                            b = !0;
                            break a;
                        default:
                            b = !1
                    }
                    b ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a)
                }
            };
            e.prototype.resolveToNonPromiseObj_ = function(a) {
                var b =
                    void 0;
                try {
                    b = a.then
                } catch (k) {
                    this.reject_(k);
                    return
                }
                "function" == typeof b ? this.settleSameAsThenable_(b, a) : this.fulfill_(a)
            };
            e.prototype.reject_ = function(a) {
                this.settle_(2, a)
            };
            e.prototype.fulfill_ = function(a) {
                this.settle_(1, a)
            };
            e.prototype.settle_ = function(a, b) {
                if (0 != this.state_) throw Error("Cannot settle(" + a + ", " + b + "): Promise already settled in state" + this.state_);
                this.state_ = a;
                this.result_ = b;
                this.executeOnSettledCallbacks_()
            };
            e.prototype.executeOnSettledCallbacks_ = function() {
                if (null != this.onSettledCallbacks_) {
                    for (var a =
                            0; a < this.onSettledCallbacks_.length; ++a) f.asyncExecute(this.onSettledCallbacks_[a]);
                    this.onSettledCallbacks_ = null
                }
            };
            var f = new b;
            e.prototype.settleSameAsPromise_ = function(a) {
                var b = this.createResolveAndReject_();
                a.callWhenSettled_(b.resolve, b.reject)
            };
            e.prototype.settleSameAsThenable_ = function(a, b) {
                var c = this.createResolveAndReject_();
                try {
                    a.call(b, c.resolve, c.reject)
                } catch (l) {
                    c.reject(l)
                }
            };
            e.prototype.then = function(a, b) {
                function c(a, b) {
                    return "function" == typeof a ? function(b) {
                            try {
                                d(a(b))
                            } catch (r) {
                                f(r)
                            }
                        } :
                        b
                }
                var d, f, g = new e(function(a, b) {
                    d = a;
                    f = b
                });
                this.callWhenSettled_(c(a, d), c(b, f));
                return g
            };
            e.prototype["catch"] = function(a) {
                return this.then(void 0, a)
            };
            e.prototype.callWhenSettled_ = function(a, b) {
                function c() {
                    switch (d.state_) {
                        case 1:
                            a(d.result_);
                            break;
                        case 2:
                            b(d.result_);
                            break;
                        default:
                            throw Error("Unexpected state: " + d.state_);
                    }
                }
                var d = this;
                null == this.onSettledCallbacks_ ? f.asyncExecute(c) : this.onSettledCallbacks_.push(c)
            };
            e.resolve = c;
            e.reject = function(a) {
                return new e(function(b, c) {
                    c(a)
                })
            };
            e.race = function(a) {
                return new e(function(b,
                    d) {
                    for (var e = $jscomp.makeIterator(a), f = e.next(); !f.done; f = e.next()) c(f.value).callWhenSettled_(b, d)
                })
            };
            e.all = function(a) {
                var b = $jscomp.makeIterator(a),
                    d = b.next();
                return d.done ? c([]) : new e(function(a, e) {
                    function f(b) {
                        return function(c) {
                            g[b] = c;
                            h--;
                            0 == h && a(g)
                        }
                    }
                    var g = [],
                        h = 0;
                    do g.push(void 0), h++, c(d.value).callWhenSettled_(f(g.length - 1), e), d = b.next(); while (!d.done)
                })
            };
            return e
        }, "es6", "es3");
        $jscomp.polyfill("Promise.prototype.finally", function(a) {
            return a ? a : function(a) {
                return this.then(function(b) {
                    return Promise.resolve(a()).then(function() {
                        return b
                    })
                }, function(b) {
                    return Promise.resolve(a()).then(function() {
                        throw b;
                    })
                })
            }
        }, "es8", "es3");
        $jscomp.asyncExecutePromiseGenerator = function(a) {
            function b(b) {
                return a.next(b)
            }

            function c(b) {
                return a["throw"](b)
            }
            return new Promise(function(d, e) {
                function f(a) {
                    a.done ? d(a.value) : Promise.resolve(a.value).then(b, c).then(f, e)
                }
                f(a.next())
            })
        };
        $jscomp.asyncExecutePromiseGeneratorFunction = function(a) {
            return $jscomp.asyncExecutePromiseGenerator(a())
        };
        $jscomp.objectCreate = $jscomp.ASSUME_ES5 || "function" == typeof Object.create ? Object.create : function(a) {
            var b = function() {};
            b.prototype = a;
            return new b
        };
        $jscomp.underscoreProtoCanBeSet = function() {
            var a = {
                    a: !0
                },
                b = {};
            try {
                return b.__proto__ = a, b.a
            } catch (c) {}
            return !1
        };
        $jscomp.setPrototypeOf = "function" == typeof Object.setPrototypeOf ? Object.setPrototypeOf : $jscomp.underscoreProtoCanBeSet() ? function(a, b) {
            a.__proto__ = b;
            if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
            return a
        } : null;
        $jscomp.inherits = function(a, b) {
            a.prototype = $jscomp.objectCreate(b.prototype);
            a.prototype.constructor = a;
            if ($jscomp.setPrototypeOf) {
                var c = $jscomp.setPrototypeOf;
                c(a, b)
            } else
                for (c in b)
                    if ("prototype" != c)
                        if (Object.defineProperties) {
                            var d = Object.getOwnPropertyDescriptor(b, c);
                            d && Object.defineProperty(a, c, d)
                        } else a[c] = b[c];
            a.superClass_ = b.prototype
        };
        $jscomp.generator = {};
        $jscomp.generator.ensureIteratorResultIsObject_ = function(a) {
            if (!(a instanceof Object)) throw new TypeError("Iterator result " + a + " is not an object");
        };
        $jscomp.generator.Context = function() {
            this.isRunning_ = !1;
            this.yieldAllIterator_ = null;
            this.yieldResult = void 0;
            this.nextAddress = 1;
            this.finallyAddress_ = this.catchAddress_ = 0;
            this.finallyContexts_ = this.abruptCompletion_ = null
        };
        $jscomp.generator.Context.prototype.start_ = function() {
            if (this.isRunning_) throw new TypeError("Generator is already running");
            this.isRunning_ = !0
        };
        $jscomp.generator.Context.prototype.stop_ = function() {
            this.isRunning_ = !1
        };
        $jscomp.generator.Context.prototype.jumpToErrorHandler_ = function() {
            this.nextAddress = this.catchAddress_ || this.finallyAddress_
        };
        $jscomp.generator.Context.prototype.next_ = function(a) {
            this.yieldResult = a
        };
        $jscomp.generator.Context.prototype.throw_ = function(a) {
            this.abruptCompletion_ = {
                exception: a,
                isException: !0
            };
            this.jumpToErrorHandler_()
        };
        $jscomp.generator.Context.prototype["return"] = function(a) {
            this.abruptCompletion_ = {
                "return": a
            };
            this.nextAddress = this.finallyAddress_
        };
        $jscomp.generator.Context.prototype.jumpThroughFinallyBlocks = function(a) {
            this.abruptCompletion_ = {
                jumpTo: a
            };
            this.nextAddress = this.finallyAddress_
        };
        $jscomp.generator.Context.prototype.yield = function(a, b) {
            this.nextAddress = b;
            return {
                value: a
            }
        };
        $jscomp.generator.Context.prototype.yieldAll = function(a, b) {
            var c = $jscomp.makeIterator(a),
                d = c.next();
            $jscomp.generator.ensureIteratorResultIsObject_(d);
            if (d.done) this.yieldResult = d.value, this.nextAddress = b;
            else return this.yieldAllIterator_ = c, this.yield(d.value, b)
        };
        $jscomp.generator.Context.prototype.jumpTo = function(a) {
            this.nextAddress = a
        };
        $jscomp.generator.Context.prototype.jumpToEnd = function() {
            this.nextAddress = 0
        };
        $jscomp.generator.Context.prototype.setCatchFinallyBlocks = function(a, b) {
            this.catchAddress_ = a;
            void 0 != b && (this.finallyAddress_ = b)
        };
        $jscomp.generator.Context.prototype.setFinallyBlock = function(a) {
            this.catchAddress_ = 0;
            this.finallyAddress_ = a || 0
        };
        $jscomp.generator.Context.prototype.leaveTryBlock = function(a, b) {
            this.nextAddress = a;
            this.catchAddress_ = b || 0
        };
        $jscomp.generator.Context.prototype.enterCatchBlock = function(a) {
            this.catchAddress_ = a || 0;
            a = this.abruptCompletion_.exception;
            this.abruptCompletion_ = null;
            return a
        };
        $jscomp.generator.Context.prototype.enterFinallyBlock = function(a, b, c) {
            c ? this.finallyContexts_[c] = this.abruptCompletion_ : this.finallyContexts_ = [this.abruptCompletion_];
            this.catchAddress_ = a || 0;
            this.finallyAddress_ = b || 0
        };
        $jscomp.generator.Context.prototype.leaveFinallyBlock = function(a, b) {
            var c = this.finallyContexts_.splice(b || 0)[0];
            if (c = this.abruptCompletion_ = this.abruptCompletion_ || c) {
                if (c.isException) return this.jumpToErrorHandler_();
                void 0 != c.jumpTo && this.finallyAddress_ < c.jumpTo ? (this.nextAddress = c.jumpTo, this.abruptCompletion_ = null) : this.nextAddress = this.finallyAddress_
            } else this.nextAddress = a
        };
        $jscomp.generator.Context.prototype.forIn = function(a) {
            return new $jscomp.generator.Context.PropertyIterator(a)
        };
        $jscomp.generator.Context.PropertyIterator = function(a) {
            this.object_ = a;
            this.properties_ = [];
            for (var b in a) this.properties_.push(b);
            this.properties_.reverse()
        };
        $jscomp.generator.Context.PropertyIterator.prototype.getNext = function() {
            for (; 0 < this.properties_.length;) {
                var a = this.properties_.pop();
                if (a in this.object_) return a
            }
            return null
        };
        $jscomp.generator.Engine_ = function(a) {
            this.context_ = new $jscomp.generator.Context;
            this.program_ = a
        };
        $jscomp.generator.Engine_.prototype.next_ = function(a) {
            this.context_.start_();
            if (this.context_.yieldAllIterator_) return this.yieldAllStep_(this.context_.yieldAllIterator_.next, a, this.context_.next_);
            this.context_.next_(a);
            return this.nextStep_()
        };
        $jscomp.generator.Engine_.prototype.return_ = function(a) {
            this.context_.start_();
            var b = this.context_.yieldAllIterator_;
            if (b) return this.yieldAllStep_("return" in b ? b["return"] : function(a) {
                return {
                    value: a,
                    done: !0
                }
            }, a, this.context_["return"]);
            this.context_["return"](a);
            return this.nextStep_()
        };
        $jscomp.generator.Engine_.prototype.throw_ = function(a) {
            this.context_.start_();
            if (this.context_.yieldAllIterator_) return this.yieldAllStep_(this.context_.yieldAllIterator_["throw"], a, this.context_.next_);
            this.context_.throw_(a);
            return this.nextStep_()
        };
        $jscomp.generator.Engine_.prototype.yieldAllStep_ = function(a, b, c) {
            try {
                var d = a.call(this.context_.yieldAllIterator_, b);
                $jscomp.generator.ensureIteratorResultIsObject_(d);
                if (!d.done) return this.context_.stop_(), d;
                var e = d.value
            } catch (f) {
                return this.context_.yieldAllIterator_ = null, this.context_.throw_(f), this.nextStep_()
            }
            this.context_.yieldAllIterator_ = null;
            c.call(this.context_, e);
            return this.nextStep_()
        };
        $jscomp.generator.Engine_.prototype.nextStep_ = function() {
            for (; this.context_.nextAddress;) try {
                var a = this.program_(this.context_);
                if (a) return this.context_.stop_(), {
                    value: a.value,
                    done: !1
                }
            } catch (b) {
                this.context_.yieldResult = void 0, this.context_.throw_(b)
            }
            this.context_.stop_();
            if (this.context_.abruptCompletion_) {
                a = this.context_.abruptCompletion_;
                this.context_.abruptCompletion_ = null;
                if (a.isException) throw a.exception;
                return {
                    value: a["return"],
                    done: !0
                }
            }
            return {
                value: void 0,
                done: !0
            }
        };
        $jscomp.generator.Generator_ = function(a) {
            this.next = function(b) {
                return a.next_(b)
            };
            this["throw"] = function(b) {
                return a.throw_(b)
            };
            this["return"] = function(b) {
                return a.return_(b)
            };
            $jscomp.initSymbolIterator();
            this[Symbol.iterator] = function() {
                return this
            }
        };
        $jscomp.generator.createGenerator = function(a, b) {
            $jscomp.generator.Generator_.prototype = a.prototype;
            return new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(b))
        };
        $jscomp.arrayFromIterator = function(a) {
            for (var b, c = []; !(b = a.next()).done;) c.push(b.value);
            return c
        };
        $jscomp.arrayFromIterable = function(a) {
            return a instanceof Array ? a : $jscomp.arrayFromIterator($jscomp.makeIterator(a))
        };
        $jscomp.checkEs6ConformanceViaProxy = function() {
            try {
                var a = {},
                    b = Object.create(new $jscomp.global.Proxy(a, {
                        get: function(c, d, e) {
                            return c == a && "q" == d && e == b
                        }
                    }));
                return !0 === b.q
            } catch (c) {
                return !1
            }
        };
        $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = !1;
        $jscomp.ES6_CONFORMANCE = $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS && $jscomp.checkEs6ConformanceViaProxy();
        $jscomp.owns = function(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b)
        };
        $jscomp.polyfill("WeakMap", function(a) {
            function b() {
                if (!a || !Object.seal) return !1;
                try {
                    var b = Object.seal({}),
                        c = Object.seal({}),
                        d = new a([
                            [b, 2],
                            [c, 3]
                        ]);
                    if (2 != d.get(b) || 3 != d.get(c)) return !1;
                    d["delete"](b);
                    d.set(c, 4);
                    return !d.has(b) && 4 == d.get(c)
                } catch (m) {
                    return !1
                }
            }

            function c(a) {
                $jscomp.owns(a, e) || $jscomp.defineProperty(a, e, {
                    value: {}
                })
            }

            function d(a) {
                var b = Object[a];
                b && (Object[a] = function(a) {
                    c(a);
                    return b(a)
                })
            }
            if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
                if (a && $jscomp.ES6_CONFORMANCE) return a
            } else if (b()) return a;
            var e = "$jscomp_hidden_" + Math.random();
            d("freeze");
            d("preventExtensions");
            d("seal");
            var f = 0,
                g = function(a) {
                    this.id_ = (f += Math.random() + 1).toString();
                    if (a) {
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        a = $jscomp.makeIterator(a);
                        for (var b; !(b = a.next()).done;) b = b.value, this.set(b[0], b[1])
                    }
                };
            g.prototype.set = function(a, b) {
                c(a);
                if (!$jscomp.owns(a, e)) throw Error("WeakMap key fail: " + a);
                a[e][this.id_] = b;
                return this
            };
            g.prototype.get = function(a) {
                return $jscomp.owns(a, e) ? a[e][this.id_] : void 0
            };
            g.prototype.has =
                function(a) {
                    return $jscomp.owns(a, e) && $jscomp.owns(a[e], this.id_)
                };
            g.prototype["delete"] = function(a) {
                return $jscomp.owns(a, e) && $jscomp.owns(a[e], this.id_) ? delete a[e][this.id_] : !1
            };
            return g
        }, "es6", "es3");
        $jscomp.MapEntry = function() {};
        $jscomp.polyfill("Map", function(a) {
            function b() {
                if ($jscomp.ASSUME_NO_NATIVE_MAP || !a || "function" != typeof a || !a.prototype.entries || "function" != typeof Object.seal) return !1;
                try {
                    var b = Object.seal({
                            x: 4
                        }),
                        c = new a($jscomp.makeIterator([
                            [b, "s"]
                        ]));
                    if ("s" != c.get(b) || 1 != c.size || c.get({
                            x: 4
                        }) || c.set({
                            x: 4
                        }, "t") != c || 2 != c.size) return !1;
                    var d = c.entries(),
                        e = d.next();
                    if (e.done || e.value[0] != b || "s" != e.value[1]) return !1;
                    e = d.next();
                    return e.done || 4 != e.value[0].x || "t" != e.value[1] || !d.next().done ? !1 : !0
                } catch (q) {
                    return !1
                }
            }
            if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
                if (a && $jscomp.ES6_CONFORMANCE) return a
            } else if (b()) return a;
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            var c = new WeakMap,
                d = function(a) {
                    this.data_ = {};
                    this.head_ = g();
                    this.size = 0;
                    if (a) {
                        a = $jscomp.makeIterator(a);
                        for (var b; !(b = a.next()).done;) b = b.value, this.set(b[0], b[1])
                    }
                };
            d.prototype.set = function(a, b) {
                var c = e(this, a);
                c.list || (c.list = this.data_[c.id] = []);
                c.entry ? c.entry.value = b : (c.entry = {
                    next: this.head_,
                    previous: this.head_.previous,
                    head: this.head_,
                    key: a,
                    value: b
                }, c.list.push(c.entry), this.head_.previous.next = c.entry, this.head_.previous = c.entry, this.size++);
                return this
            };
            d.prototype["delete"] = function(a) {
                a = e(this, a);
                return a.entry && a.list ? (a.list.splice(a.index, 1), a.list.length || delete this.data_[a.id], a.entry.previous.next = a.entry.next, a.entry.next.previous = a.entry.previous, a.entry.head = null, this.size--, !0) : !1
            };
            d.prototype.clear = function() {
                this.data_ = {};
                this.head_ = this.head_.previous = g();
                this.size = 0
            };
            d.prototype.has = function(a) {
                return !!e(this,
                    a).entry
            };
            d.prototype.get = function(a) {
                return (a = e(this, a).entry) && a.value
            };
            d.prototype.entries = function() {
                return f(this, function(a) {
                    return [a.key, a.value]
                })
            };
            d.prototype.keys = function() {
                return f(this, function(a) {
                    return a.key
                })
            };
            d.prototype.values = function() {
                return f(this, function(a) {
                    return a.value
                })
            };
            d.prototype.forEach = function(a, b) {
                for (var c = this.entries(), d; !(d = c.next()).done;) d = d.value, a.call(b, d[1], d[0], this)
            };
            d.prototype[Symbol.iterator] = d.prototype.entries;
            var e = function(a, b) {
                    var d = b && typeof b;
                    "object" == d || "function" == d ? c.has(b) ? d = c.get(b) : (d = "" + ++h, c.set(b, d)) : d = "p_" + b;
                    var e = a.data_[d];
                    if (e && $jscomp.owns(a.data_, d))
                        for (var f = 0; f < e.length; f++) {
                            var g = e[f];
                            if (b !== b && g.key !== g.key || b === g.key) return {
                                id: d,
                                list: e,
                                index: f,
                                entry: g
                            }
                        }
                    return {
                        id: d,
                        list: e,
                        index: -1,
                        entry: void 0
                    }
                },
                f = function(a, b) {
                    var c = a.head_;
                    return $jscomp.iteratorPrototype(function() {
                        if (c) {
                            for (; c.head != a.head_;) c = c.previous;
                            for (; c.next != c.head;) return c = c.next, {
                                done: !1,
                                value: b(c)
                            };
                            c = null
                        }
                        return {
                            done: !0,
                            value: void 0
                        }
                    })
                },
                g = function() {
                    var a = {};
                    return a.previous = a.next = a.head = a
                },
                h = 0;
            return d
        }, "es6", "es3");
        $jscomp.polyfill("Set", function(a) {
            function b() {
                if ($jscomp.ASSUME_NO_NATIVE_SET || !a || "function" != typeof a || !a.prototype.entries || "function" != typeof Object.seal) return !1;
                try {
                    var b = Object.seal({
                            x: 4
                        }),
                        c = new a($jscomp.makeIterator([b]));
                    if (!c.has(b) || 1 != c.size || c.add(b) != c || 1 != c.size || c.add({
                            x: 4
                        }) != c || 2 != c.size) return !1;
                    var f = c.entries(),
                        g = f.next();
                    if (g.done || g.value[0] != b || g.value[1] != b) return !1;
                    g = f.next();
                    return g.done || g.value[0] == b || 4 != g.value[0].x || g.value[1] != g.value[0] ? !1 : f.next().done
                } catch (h) {
                    return !1
                }
            }
            if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
                if (a && $jscomp.ES6_CONFORMANCE) return a
            } else if (b()) return a;
            $jscomp.initSymbol();
            $jscomp.initSymbolIterator();
            var c = function(a) {
                this.map_ = new Map;
                if (a) {
                    a = $jscomp.makeIterator(a);
                    for (var b; !(b = a.next()).done;) this.add(b.value)
                }
                this.size = this.map_.size
            };
            c.prototype.add = function(a) {
                this.map_.set(a, a);
                this.size = this.map_.size;
                return this
            };
            c.prototype["delete"] = function(a) {
                a = this.map_["delete"](a);
                this.size = this.map_.size;
                return a
            };
            c.prototype.clear = function() {
                this.map_.clear();
                this.size = 0
            };
            c.prototype.has = function(a) {
                return this.map_.has(a)
            };
            c.prototype.entries = function() {
                return this.map_.entries()
            };
            c.prototype.values = function() {
                return this.map_.values()
            };
            c.prototype.keys = c.prototype.values;
            c.prototype[Symbol.iterator] = c.prototype.values;
            c.prototype.forEach = function(a, b) {
                var c = this;
                this.map_.forEach(function(d) {
                    return a.call(b, d, d, c)
                })
            };
            return c
        }, "es6", "es3");
        $jscomp.findInternal = function(a, b, c) {
            a instanceof String && (a = String(a));
            for (var d = a.length, e = 0; e < d; e++) {
                var f = a[e];
                if (b.call(c, f, e, a)) return {
                    i: e,
                    v: f
                }
            }
            return {
                i: -1,
                v: void 0
            }
        };
        $jscomp.polyfill("Array.prototype.findIndex", function(a) {
            return a ? a : function(a, c) {
                return $jscomp.findInternal(this, a, c).i
            }
        }, "es6", "es3");
        $jscomp.iteratorFromArray = function(a, b) {
            $jscomp.initSymbolIterator();
            a instanceof String && (a += "");
            var c = 0,
                d = {
                    next: function() {
                        if (c < a.length) {
                            var e = c++;
                            return {
                                value: b(e, a[e]),
                                done: !1
                            }
                        }
                        d.next = function() {
                            return {
                                done: !0,
                                value: void 0
                            }
                        };
                        return d.next()
                    }
                };
            d[Symbol.iterator] = function() {
                return d
            };
            return d
        };
        $jscomp.polyfill("Array.prototype.keys", function(a) {
            return a ? a : function() {
                return $jscomp.iteratorFromArray(this, function(a) {
                    return a
                })
            }
        }, "es6", "es3");
        $jscomp.polyfill("Object.is", function(a) {
            return a ? a : function(a, c) {
                return a === c ? 0 !== a || 1 / a === 1 / c : a !== a && c !== c
            }
        }, "es6", "es3");
        $jscomp.polyfill("Array.prototype.includes", function(a) {
            return a ? a : function(a, c) {
                var b = this;
                b instanceof String && (b = String(b));
                var e = b.length,
                    f = c || 0;
                for (0 > f && (f = Math.max(f + e, 0)); f < e; f++) {
                    var g = b[f];
                    if (g === a || Object.is(g, a)) return !0
                }
                return !1
            }
        }, "es7", "es3");
        $jscomp.checkStringArgs = function(a, b, c) {
            if (null == a) throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
            if (b instanceof RegExp) throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
            return a + ""
        };
        $jscomp.polyfill("String.prototype.includes", function(a) {
            return a ? a : function(a, c) {
                return -1 !== $jscomp.checkStringArgs(this, a, "includes").indexOf(a, c || 0)
            }
        }, "es6", "es3");
        $jscomp.polyfill("Array.from", function(a) {
            return a ? a : function(a, c, d) {
                $jscomp.initSymbolIterator();
                c = null != c ? c : function(a) {
                    return a
                };
                var b = [],
                    f = a[Symbol.iterator];
                if ("function" == typeof f)
                    for (a = f.call(a); !(f = a.next()).done;) b.push(c.call(d, f.value));
                else {
                    f = a.length;
                    for (var g = 0; g < f; g++) b.push(c.call(d, a[g]))
                }
                return b
            }
        }, "es6", "es3");
        $jscomp.polyfill("String.prototype.startsWith", function(a) {
            return a ? a : function(a, c) {
                var b = $jscomp.checkStringArgs(this, a, "startsWith");
                a += "";
                for (var e = b.length, f = a.length, g = Math.max(0, Math.min(c | 0, b.length)), h = 0; h < f && g < e;)
                    if (b[g++] != a[h++]) return !1;
                return h >= f
            }
        }, "es6", "es3");
        $jscomp.polyfill("Array.prototype.find", function(a) {
            return a ? a : function(a, c) {
                return $jscomp.findInternal(this, a, c).v
            }
        }, "es6", "es3");
        $jscomp.assign = "function" == typeof Object.assign ? Object.assign : function(a, b) {
            for (var c = 1; c < arguments.length; c++) {
                var d = arguments[c];
                if (d)
                    for (var e in d) $jscomp.owns(d, e) && (a[e] = d[e])
            }
            return a
        };
        $jscomp.polyfill("Object.assign", function(a) {
            return a || $jscomp.assign
        }, "es6", "es3");
        var COMPILED = !0,
            goog = goog || {};
        goog.global = this;
        goog.isDef = function(a) {
            return void 0 !== a
        };
        goog.exportPath_ = function(a, b, c) {
            a = a.split(".");
            c = c || goog.global;
            a[0] in c || !c.execScript || c.execScript("var " + a[0]);
            for (var d; a.length && (d = a.shift());) !a.length && goog.isDef(b) ? c[d] = b : c = c[d] ? c[d] : c[d] = {}
        };
        goog.define = function(a, b) {
            var c = b;
            COMPILED || (goog.global.CLOSURE_UNCOMPILED_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_UNCOMPILED_DEFINES, a) ? c = goog.global.CLOSURE_UNCOMPILED_DEFINES[a] : goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, a) && (c = goog.global.CLOSURE_DEFINES[a]));
            goog.exportPath_(a, c)
        };
        goog.DEBUG = !0;
        goog.LOCALE = "en";
        goog.TRUSTED_SITE = !0;
        goog.STRICT_MODE_COMPATIBLE = !0;
        goog.provide = function(a) {
            if (!COMPILED) {
                if (goog.isProvided_(a)) throw Error('Namespace "' + a + '" already declared.');
                delete goog.implicitNamespaces_[a];
                for (var b = a;
                    (b = b.substring(0, b.lastIndexOf("."))) && !goog.getObjectByName(b);) goog.implicitNamespaces_[b] = !0
            }
            goog.exportPath_(a)
        };
        goog.forwardDeclare = function(a) {};
        COMPILED || (goog.isProvided_ = function(a) {
            return !goog.implicitNamespaces_[a] && goog.isDefAndNotNull(goog.getObjectByName(a))
        }, goog.implicitNamespaces_ = {});
        goog.getObjectByName = function(a, b) {
            for (var c = a.split("."), d = b || goog.global, e; e = c.shift();)
                if (goog.isDefAndNotNull(d[e])) d = d[e];
                else return null;
            return d
        };
        goog.globalize = function(a, b) {
            b = b || goog.global;
            for (var c in a) b[c] = a[c]
        };
        goog.addDependency = function(a, b, c) {
            if (goog.DEPENDENCIES_ENABLED) {
                var d;
                a = a.replace(/\\/g, "/");
                for (var e = goog.dependencies_, f = 0; d = b[f]; f++) e.nameToPath[d] = a;
                for (d = 0; b = c[d]; d++) a in e.requires || (e.requires[a] = {}), e.requires[a][b] = !0
            }
        };
        goog.ENABLE_DEBUG_LOADER = !1;
        goog.logToConsole_ = function(a) {
            goog.global.console && goog.global.console.error(a)
        };
        goog.require = function(a) {
            if (!COMPILED) {
                if (goog.isProvided_(a)) return null;
                if (goog.ENABLE_DEBUG_LOADER) {
                    var b = goog.getPathFromDeps_(a);
                    if (b) return goog.included_[b] = !0, goog.writeScripts_(), null
                }
                a = "goog.require could not find: " + a;
                goog.logToConsole_(a);
                throw Error(a);
            }
        };
        goog.basePath = "";
        goog.global.CLOSURE_NO_DEPS = !0;
        goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
        goog.DEPENDENCIES_ENABLED && (goog.included_ = {}, goog.dependencies_ = {
            nameToPath: {},
            requires: {},
            visited: {},
            written: {}
        }, goog.inHtmlDocument_ = function() {
            var a = goog.global.document;
            return "undefined" != typeof a && "write" in a
        }, goog.findBasePath_ = function() {
            if (goog.global.CLOSURE_BASE_PATH) goog.basePath = goog.global.CLOSURE_BASE_PATH;
            else if (goog.inHtmlDocument_())
                for (var a = goog.global.document.getElementsByTagName("script"), b = a.length - 1; 0 <= b; --b) {
                    var c = a[b].src,
                        d = c.lastIndexOf("?");
                    d = -1 == d ? c.length : d;
                    if ("base.js" ==
                        c.substr(d - 7, 7)) {
                        goog.basePath = c.substr(0, d - 7);
                        break
                    }
                }
        }, goog.importScript_ = function(a, b) {
            (goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_)(a, b) && (goog.dependencies_.written[a] = !0)
        }, goog.writeScriptTag_ = function(a, b) {
            if (goog.inHtmlDocument_()) {
                var c = goog.global.document;
                if ("complete" == c.readyState) {
                    if (/\bdeps.js$/.test(a)) return !1;
                    throw Error('Cannot write "' + a + '" after document load');
                }
                void 0 === b ? c.write('<script type="text/javascript" src="' + a + '">\x3c/script>') : c.write('<script type="text/javascript">' +
                    b + "\x3c/script>");
                return !0
            }
            return !1
        }, goog.writeScripts_ = function() {
            function a(e) {
                if (!(e in d.written)) {
                    if (!(e in d.visited) && (d.visited[e] = !0, e in d.requires))
                        for (var f in d.requires[e])
                            if (!goog.isProvided_(f))
                                if (f in d.nameToPath) a(d.nameToPath[f]);
                                else throw Error("Undefined nameToPath for " + f);
                    e in c || (c[e] = !0, b.push(e))
                }
            }
            var b = [],
                c = {},
                d = goog.dependencies_;
            for (f in goog.included_) d.written[f] || a(f);
            for (var e = 0; e < b.length; e++) {
                var f = b[e];
                goog.dependencies_.written[f] = !0
            }
            for (e = 0; e < b.length; e++)(f =
                b[e]) && goog.importScript_(goog.basePath + f)
        }, goog.getPathFromDeps_ = function(a) {
            return a in goog.dependencies_.nameToPath ? goog.dependencies_.nameToPath[a] : null
        }, goog.findBasePath_(), goog.global.CLOSURE_NO_DEPS || goog.importScript_(goog.basePath + "deps.js"));
        goog.isDefAndNotNull = function(a) {
            return null != a
        };
        goog.isString = function(a) {
            return "string" == typeof a
        };
        goog.exportSymbol = function(a, b, c) {
            goog.exportPath_(a, b, c)
        };
        goog.exportProperty = function(a, b, c) {
            a[b] = c
        };
        goog.inherits = function(a, b) {
            function c() {}
            c.prototype = b.prototype;
            a.superClass_ = b.prototype;
            a.prototype = new c;
            a.prototype.constructor = a;
            a.base = function(a, c, f) {
                var d = Array.prototype.slice.call(arguments, 2);
                return b.prototype[c].apply(a, d)
            }
        };
        COMPILED || (goog.global.COMPILED = COMPILED);
        /*

         Copyright 2016 Google Inc.

         Licensed under the Apache License, Version 2.0 (the "License");
         you may not use this file except in compliance with the License.
         You may obtain a copy of the License at

             http://www.apache.org/licenses/LICENSE-2.0

         Unless required by applicable law or agreed to in writing, software
         distributed under the License is distributed on an "AS IS" BASIS,
         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
         See the License for the specific language governing permissions and
         limitations under the License.
        */
        goog.asserts = {};
        goog.asserts.ENABLE_ASSERTS = !0;
        goog.asserts.assert = function() {};
        goog.asserts.patchAssert_ = function() {
            var a = console.assert;
            a ? a.bind || (console.assert = function() {
                a.apply(console, arguments)
            }) : console.assert = function() {}
        };
        goog.asserts.ENABLE_ASSERTS && (goog.asserts.patchAssert_(), goog.asserts.assert = console.assert.bind(console));
        var shaka = {
            abr: {}
        };
        shaka.abr.Ewma = function(a) {
            goog.asserts.assert(0 < a, "expected halfLife to be positive");
            this.alpha_ = Math.exp(Math.log(.5) / a);
            this.totalWeight_ = this.estimate_ = 0
        };
        shaka.abr.Ewma.prototype.sample = function(a, b) {
            var c = Math.pow(this.alpha_, a);
            c = b * (1 - c) + c * this.estimate_;
            isNaN(c) || (this.estimate_ = c, this.totalWeight_ += a)
        };
        shaka.abr.Ewma.prototype.getEstimate = function() {
            return this.estimate_ / (1 - Math.pow(this.alpha_, this.totalWeight_))
        };
        shaka.abr.EwmaBandwidthEstimator = function() {
            this.fast_ = new shaka.abr.Ewma(2);
            this.slow_ = new shaka.abr.Ewma(5);
            this.bytesSampled_ = 0;
            this.minTotalBytes_ = 128E3;
            this.minBytes_ = 16E3
        };
        shaka.abr.EwmaBandwidthEstimator.prototype.sample = function(a, b) {
            if (!(b < this.minBytes_)) {
                var c = 8E3 * b / a,
                    d = a / 1E3;
                this.bytesSampled_ += b;
                this.fast_.sample(d, c);
                this.slow_.sample(d, c)
            }
        };
        shaka.abr.EwmaBandwidthEstimator.prototype.getBandwidthEstimate = function(a) {
            return this.bytesSampled_ < this.minTotalBytes_ ? a : Math.min(this.fast_.getEstimate(), this.slow_.getEstimate())
        };
        shaka.abr.EwmaBandwidthEstimator.prototype.hasGoodEstimate = function() {
            return this.bytesSampled_ >= this.minTotalBytes_
        };
        shaka.log = {};
        shaka.log.Level = {
            NONE: 0,
            ERROR: 1,
            WARNING: 2,
            INFO: 3,
            DEBUG: 4,
            V1: 5,
            V2: 6
        };
        shaka.log.MAX_LOG_LEVEL = 4;
        shaka.log.alwaysError = function() {};
        shaka.log.alwaysWarn = function() {};
        shaka.log.error = function() {};
        shaka.log.warning = function() {};
        shaka.log.info = function() {};
        shaka.log.debug = function() {};
        shaka.log.v1 = function() {};
        shaka.log.v2 = function() {};
        window.console && window.console.log.bind && (shaka.log.alwaysWarn = console.warn.bind(console), shaka.log.alwaysError = console.error.bind(console), goog.DEBUG ? (goog.exportSymbol("shaka.log", shaka.log), shaka.log.setLevel = function(a) {
            var b = function() {},
                c = shaka.log,
                d = shaka.log.Level;
            shaka.log.currentLevel = a;
            c.error = a >= d.ERROR ? console.error.bind(console) : b;
            c.warning = a >= d.WARNING ? console.warn.bind(console) : b;
            c.info = a >= d.INFO ? console.info.bind(console) : b;
            c.debug = a >= d.DEBUG ? console.log.bind(console) : b;
            c.v1 = a >= d.V1 ?
                console.debug.bind(console) : b;
            c.v2 = a >= d.V2 ? console.debug.bind(console) : b
        }, shaka.log.setLevel(shaka.log.MAX_LOG_LEVEL)) : (shaka.log.MAX_LOG_LEVEL >= shaka.log.Level.ERROR && (shaka.log.error = console.error.bind(console)), shaka.log.MAX_LOG_LEVEL >= shaka.log.Level.WARNING && (shaka.log.warning = console.warn.bind(console)), shaka.log.MAX_LOG_LEVEL >= shaka.log.Level.INFO && (shaka.log.info = console.info.bind(console)), shaka.log.MAX_LOG_LEVEL >= shaka.log.Level.DEBUG && (shaka.log.debug = console.log.bind(console)), shaka.log.MAX_LOG_LEVEL >=
            shaka.log.Level.V1 && (shaka.log.v1 = console.debug.bind(console)), shaka.log.MAX_LOG_LEVEL >= shaka.log.Level.V2 && (shaka.log.v2 = console.debug.bind(console))));
        shaka.util = {};
        shaka.util.Error = function(a, b, c, d) {
            for (var e = [], f = 3; f < arguments.length; ++f) e[f - 3] = arguments[f];
            this.severity = a;
            this.category = b;
            this.code = c;
            this.data = e;
            this.handled = !1;
            if (goog.DEBUG) {
                f = e = "UNKNOWN";
                for (var g in shaka.util.Error.Category) shaka.util.Error.Category[g] == this.category && (e = g);
                for (var h in shaka.util.Error.Code) shaka.util.Error.Code[h] == this.code && (f = h);
                this.message = "Shaka Error " + e + "." + f + " (" + this.data.toString() + ")";
                if (shaka.util.Error.createStack) try {
                    throw Error(this.message);
                } catch (k) {
                    this.stack =
                        k.stack
                }
            }
        };
        goog.exportSymbol("shaka.util.Error", shaka.util.Error);
        shaka.util.Error.prototype.toString = function() {
            return "shaka.util.Error " + JSON.stringify(this, null, "  ")
        };
        goog.DEBUG && (shaka.util.Error.createStack = !0);
        shaka.util.Error.Severity = {
            RECOVERABLE: 1,
            CRITICAL: 2
        };
        goog.exportProperty(shaka.util.Error, "Severity", shaka.util.Error.Severity);
        shaka.util.Error.Category = {
            NETWORK: 1,
            TEXT: 2,
            MEDIA: 3,
            MANIFEST: 4,
            STREAMING: 5,
            DRM: 6,
            PLAYER: 7,
            CAST: 8,
            STORAGE: 9
        };
        goog.exportProperty(shaka.util.Error, "Category", shaka.util.Error.Category);
        shaka.util.Error.Code = {
            UNSUPPORTED_SCHEME: 1E3,
            BAD_HTTP_STATUS: 1001,
            HTTP_ERROR: 1002,
            TIMEOUT: 1003,
            MALFORMED_DATA_URI: 1004,
            REQUEST_FILTER_ERROR: 1006,
            RESPONSE_FILTER_ERROR: 1007,
            MALFORMED_TEST_URI: 1008,
            UNEXPECTED_TEST_REQUEST: 1009,
            INVALID_TEXT_HEADER: 2E3,
            INVALID_TEXT_CUE: 2001,
            UNABLE_TO_DETECT_ENCODING: 2003,
            BAD_ENCODING: 2004,
            INVALID_XML: 2005,
            INVALID_MP4_TTML: 2007,
            INVALID_MP4_VTT: 2008,
            UNABLE_TO_EXTRACT_CUE_START_TIME: 2009,
            BUFFER_READ_OUT_OF_BOUNDS: 3E3,
            JS_INTEGER_OVERFLOW: 3001,
            EBML_OVERFLOW: 3002,
            EBML_BAD_FLOATING_POINT_SIZE: 3003,
            MP4_SIDX_WRONG_BOX_TYPE: 3004,
            MP4_SIDX_INVALID_TIMESCALE: 3005,
            MP4_SIDX_TYPE_NOT_SUPPORTED: 3006,
            WEBM_CUES_ELEMENT_MISSING: 3007,
            WEBM_EBML_HEADER_ELEMENT_MISSING: 3008,
            WEBM_SEGMENT_ELEMENT_MISSING: 3009,
            WEBM_INFO_ELEMENT_MISSING: 3010,
            WEBM_DURATION_ELEMENT_MISSING: 3011,
            WEBM_CUE_TRACK_POSITIONS_ELEMENT_MISSING: 3012,
            WEBM_CUE_TIME_ELEMENT_MISSING: 3013,
            MEDIA_SOURCE_OPERATION_FAILED: 3014,
            MEDIA_SOURCE_OPERATION_THREW: 3015,
            VIDEO_ERROR: 3016,
            QUOTA_EXCEEDED_ERROR: 3017,
            TRANSMUXING_FAILED: 3018,
            UNABLE_TO_GUESS_MANIFEST_TYPE: 4E3,
            DASH_INVALID_XML: 4001,
            DASH_NO_SEGMENT_INFO: 4002,
            DASH_EMPTY_ADAPTATION_SET: 4003,
            DASH_EMPTY_PERIOD: 4004,
            DASH_WEBM_MISSING_INIT: 4005,
            DASH_UNSUPPORTED_CONTAINER: 4006,
            DASH_PSSH_BAD_ENCODING: 4007,
            DASH_NO_COMMON_KEY_SYSTEM: 4008,
            DASH_MULTIPLE_KEY_IDS_NOT_SUPPORTED: 4009,
            DASH_CONFLICTING_KEY_IDS: 4010,
            UNPLAYABLE_PERIOD: 4011,
            RESTRICTIONS_CANNOT_BE_MET: 4012,
            NO_PERIODS: 4014,
            HLS_PLAYLIST_HEADER_MISSING: 4015,
            INVALID_HLS_TAG: 4016,
            HLS_INVALID_PLAYLIST_HIERARCHY: 4017,
            DASH_DUPLICATE_REPRESENTATION_ID: 4018,
            HLS_MULTIPLE_MEDIA_INIT_SECTIONS_FOUND: 4020,
            HLS_COULD_NOT_GUESS_MIME_TYPE: 4021,
            HLS_MASTER_PLAYLIST_NOT_PROVIDED: 4022,
            HLS_REQUIRED_ATTRIBUTE_MISSING: 4023,
            HLS_REQUIRED_TAG_MISSING: 4024,
            HLS_COULD_NOT_GUESS_CODECS: 4025,
            HLS_KEYFORMATS_NOT_SUPPORTED: 4026,
            DASH_UNSUPPORTED_XLINK_ACTUATE: 4027,
            DASH_XLINK_DEPTH_LIMIT: 4028,
            HLS_COULD_NOT_PARSE_SEGMENT_START_TIME: 4030,
            CONTENT_UNSUPPORTED_BY_BROWSER: 4032,
            CANNOT_ADD_EXTERNAL_TEXT_TO_LIVE_STREAM: 4033,
            HLS_AES_128_ENCRYPTION_NOT_SUPPORTED: 4034,
            HLS_INTERNAL_SKIP_STREAM: 4035,
            INVALID_STREAMS_CHOSEN: 5005,
            NO_RECOGNIZED_KEY_SYSTEMS: 6E3,
            REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE: 6001,
            FAILED_TO_CREATE_CDM: 6002,
            FAILED_TO_ATTACH_TO_VIDEO: 6003,
            INVALID_SERVER_CERTIFICATE: 6004,
            FAILED_TO_CREATE_SESSION: 6005,
            FAILED_TO_GENERATE_LICENSE_REQUEST: 6006,
            LICENSE_REQUEST_FAILED: 6007,
            LICENSE_RESPONSE_REJECTED: 6008,
            ENCRYPTED_CONTENT_WITHOUT_DRM_INFO: 6010,
            NO_LICENSE_SERVER_GIVEN: 6012,
            OFFLINE_SESSION_REMOVED: 6013,
            EXPIRED: 6014,
            SERVER_CERTIFICATE_REQUIRED: 6015,
            INIT_DATA_TRANSFORM_ERROR: 6016,
            LOAD_INTERRUPTED: 7E3,
            OPERATION_ABORTED: 7001,
            NO_VIDEO_ELEMENT: 7002,
            CAST_API_UNAVAILABLE: 8E3,
            NO_CAST_RECEIVERS: 8001,
            ALREADY_CASTING: 8002,
            UNEXPECTED_CAST_ERROR: 8003,
            CAST_CANCELED_BY_USER: 8004,
            CAST_CONNECTION_TIMED_OUT: 8005,
            CAST_RECEIVER_APP_UNAVAILABLE: 8006,
            STORAGE_NOT_SUPPORTED: 9E3,
            INDEXED_DB_ERROR: 9001,
            DEPRECATED_OPERATION_ABORTED: 9002,
            REQUESTED_ITEM_NOT_FOUND: 9003,
            MALFORMED_OFFLINE_URI: 9004,
            CANNOT_STORE_LIVE_OFFLINE: 9005,
            STORE_ALREADY_IN_PROGRESS: 9006,
            NO_INIT_DATA_FOR_OFFLINE: 9007,
            LOCAL_PLAYER_INSTANCE_REQUIRED: 9008,
            NEW_KEY_OPERATION_NOT_SUPPORTED: 9011,
            KEY_NOT_FOUND: 9012,
            MISSING_STORAGE_CELL: 9013
        };
        goog.exportProperty(shaka.util.Error, "Code", shaka.util.Error.Code);
        shaka.util.IDestroyable = function() {};
        shaka.util.IDestroyable.prototype.destroy = function() {};
        /*
         @license
         Copyright 2008 The Closure Library Authors
         SPDX-License-Identifier: Apache-2.0
        */
        goog.uri = {};
        goog.uri.utils = {};
        goog.uri.utils.splitRe_ = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;
        goog.uri.utils.ComponentIndex = {
            SCHEME: 1,
            USER_INFO: 2,
            DOMAIN: 3,
            PORT: 4,
            PATH: 5,
            QUERY_DATA: 6,
            FRAGMENT: 7
        };
        goog.uri.utils.split = function(a) {
            return a.match(goog.uri.utils.splitRe_)
        };
        /*
         @license
         Copyright 2006 The Closure Library Authors
         SPDX-License-Identifier: Apache-2.0
        */
        goog.Uri = function(a) {
            var b;
            a instanceof goog.Uri ? (this.setScheme(a.getScheme()), this.setUserInfo(a.getUserInfo()), this.setDomain(a.getDomain()), this.setPort(a.getPort()), this.setPath(a.getPath()), this.setQueryData(a.getQueryData().clone()), this.setFragment(a.getFragment())) : a && (b = goog.uri.utils.split(String(a))) ? (this.setScheme(b[goog.uri.utils.ComponentIndex.SCHEME] || "", !0), this.setUserInfo(b[goog.uri.utils.ComponentIndex.USER_INFO] || "", !0), this.setDomain(b[goog.uri.utils.ComponentIndex.DOMAIN] ||
                "", !0), this.setPort(b[goog.uri.utils.ComponentIndex.PORT]), this.setPath(b[goog.uri.utils.ComponentIndex.PATH] || "", !0), this.setQueryData(b[goog.uri.utils.ComponentIndex.QUERY_DATA] || "", !0), this.setFragment(b[goog.uri.utils.ComponentIndex.FRAGMENT] || "", !0)) : this.queryData_ = new goog.Uri.QueryData(null, null)
        };
        goog.Uri.prototype.scheme_ = "";
        goog.Uri.prototype.userInfo_ = "";
        goog.Uri.prototype.domain_ = "";
        goog.Uri.prototype.port_ = null;
        goog.Uri.prototype.path_ = "";
        goog.Uri.prototype.fragment_ = "";
        goog.Uri.prototype.toString = function() {
            var a = [],
                b = this.getScheme();
            b && a.push(goog.Uri.encodeSpecialChars_(b, goog.Uri.reDisallowedInSchemeOrUserInfo_, !0), ":");
            if (b = this.getDomain()) {
                a.push("//");
                var c = this.getUserInfo();
                c && a.push(goog.Uri.encodeSpecialChars_(c, goog.Uri.reDisallowedInSchemeOrUserInfo_, !0), "@");
                a.push(goog.Uri.removeDoubleEncoding_(encodeURIComponent(b)));
                b = this.getPort();
                null != b && a.push(":", String(b))
            }
            if (b = this.getPath()) this.hasDomain() && "/" != b.charAt(0) && a.push("/"), a.push(goog.Uri.encodeSpecialChars_(b,
                "/" == b.charAt(0) ? goog.Uri.reDisallowedInAbsolutePath_ : goog.Uri.reDisallowedInRelativePath_, !0));
            (b = this.getEncodedQuery()) && a.push("?", b);
            (b = this.getFragment()) && a.push("#", goog.Uri.encodeSpecialChars_(b, goog.Uri.reDisallowedInFragment_));
            return a.join("")
        };
        goog.Uri.prototype.resolve = function(a) {
            var b = this.clone();
            "data" === b.scheme_ && (b = new goog.Uri);
            var c = a.hasScheme();
            c ? b.setScheme(a.getScheme()) : c = a.hasUserInfo();
            c ? b.setUserInfo(a.getUserInfo()) : c = a.hasDomain();
            c ? b.setDomain(a.getDomain()) : c = a.hasPort();
            var d = a.getPath();
            if (c) b.setPort(a.getPort());
            else if (c = a.hasPath()) {
                if ("/" != d.charAt(0))
                    if (this.hasDomain() && !this.hasPath()) d = "/" + d;
                    else {
                        var e = b.getPath().lastIndexOf("/"); - 1 != e && (d = b.getPath().substr(0, e + 1) + d)
                    } d = goog.Uri.removeDotSegments(d)
            }
            c ?
                b.setPath(d) : c = a.hasQuery();
            c ? b.setQueryData(a.getQueryData().clone()) : c = a.hasFragment();
            c && b.setFragment(a.getFragment());
            return b
        };
        goog.Uri.prototype.clone = function() {
            return new goog.Uri(this)
        };
        goog.Uri.prototype.getScheme = function() {
            return this.scheme_
        };
        goog.Uri.prototype.setScheme = function(a, b) {
            if (this.scheme_ = b ? goog.Uri.decodeOrEmpty_(a, !0) : a) this.scheme_ = this.scheme_.replace(/:$/, "");
            return this
        };
        goog.Uri.prototype.hasScheme = function() {
            return !!this.scheme_
        };
        goog.Uri.prototype.getUserInfo = function() {
            return this.userInfo_
        };
        goog.Uri.prototype.setUserInfo = function(a, b) {
            this.userInfo_ = b ? goog.Uri.decodeOrEmpty_(a) : a;
            return this
        };
        goog.Uri.prototype.hasUserInfo = function() {
            return !!this.userInfo_
        };
        goog.Uri.prototype.getDomain = function() {
            return this.domain_
        };
        goog.Uri.prototype.setDomain = function(a, b) {
            this.domain_ = b ? goog.Uri.decodeOrEmpty_(a, !0) : a;
            return this
        };
        goog.Uri.prototype.hasDomain = function() {
            return !!this.domain_
        };
        goog.Uri.prototype.getPort = function() {
            return this.port_
        };
        goog.Uri.prototype.setPort = function(a) {
            if (a) {
                a = Number(a);
                if (isNaN(a) || 0 > a) throw Error("Bad port number " + a);
                this.port_ = a
            } else this.port_ = null;
            return this
        };
        goog.Uri.prototype.hasPort = function() {
            return null != this.port_
        };
        goog.Uri.prototype.getPath = function() {
            return this.path_
        };
        goog.Uri.prototype.setPath = function(a, b) {
            this.path_ = b ? goog.Uri.decodeOrEmpty_(a, !0) : a;
            return this
        };
        goog.Uri.prototype.hasPath = function() {
            return !!this.path_
        };
        goog.Uri.prototype.hasQuery = function() {
            return "" !== this.queryData_.toString()
        };
        goog.Uri.prototype.setQueryData = function(a, b) {
            a instanceof goog.Uri.QueryData ? this.queryData_ = a : (b || (a = goog.Uri.encodeSpecialChars_(a, goog.Uri.reDisallowedInQuery_)), this.queryData_ = new goog.Uri.QueryData(a, null));
            return this
        };
        goog.Uri.prototype.getEncodedQuery = function() {
            return this.queryData_.toString()
        };
        goog.Uri.prototype.getDecodedQuery = function() {
            return this.queryData_.toDecodedString()
        };
        goog.Uri.prototype.getQueryData = function() {
            return this.queryData_
        };
        goog.Uri.prototype.getFragment = function() {
            return this.fragment_
        };
        goog.Uri.prototype.setFragment = function(a, b) {
            this.fragment_ = b ? goog.Uri.decodeOrEmpty_(a) : a;
            return this
        };
        goog.Uri.prototype.hasFragment = function() {
            return !!this.fragment_
        };
        goog.Uri.removeDotSegments = function(a) {
            if (".." == a || "." == a) return "";
            if (-1 == a.indexOf("./") && -1 == a.indexOf("/.")) return a;
            var b = 0 == a.lastIndexOf("/", 0);
            a = a.split("/");
            for (var c = [], d = 0; d < a.length;) {
                var e = a[d++];
                "." == e ? b && d == a.length && c.push("") : ".." == e ? ((1 < c.length || 1 == c.length && "" != c[0]) && c.pop(), b && d == a.length && c.push("")) : (c.push(e), b = !0)
            }
            return c.join("/")
        };
        goog.Uri.decodeOrEmpty_ = function(a, b) {
            return a ? b ? decodeURI(a) : decodeURIComponent(a) : ""
        };
        goog.Uri.encodeSpecialChars_ = function(a, b, c) {
            return goog.isString(a) ? (a = encodeURI(a).replace(b, goog.Uri.encodeChar_), c && (a = goog.Uri.removeDoubleEncoding_(a)), a) : null
        };
        goog.Uri.encodeChar_ = function(a) {
            a = a.charCodeAt(0);
            return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16)
        };
        goog.Uri.removeDoubleEncoding_ = function(a) {
            return a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")
        };
        goog.Uri.reDisallowedInSchemeOrUserInfo_ = /[#\/\?@]/g;
        goog.Uri.reDisallowedInRelativePath_ = /[#\?:]/g;
        goog.Uri.reDisallowedInAbsolutePath_ = /[#\?]/g;
        goog.Uri.reDisallowedInQuery_ = /[#\?@]/g;
        goog.Uri.reDisallowedInFragment_ = /#/g;
        goog.Uri.QueryData = function(a, b) {
            this.encodedQuery_ = a || null
        };
        goog.Uri.QueryData.prototype.ensureKeyMapInitialized_ = function() {
            if (!this.keyMap_ && (this.keyMap_ = {}, this.count_ = 0, this.encodedQuery_))
                for (var a = this.encodedQuery_.split("&"), b = 0; b < a.length; b++) {
                    var c = a[b].indexOf("="),
                        d = null;
                    if (0 <= c) {
                        var e = a[b].substring(0, c);
                        d = a[b].substring(c + 1)
                    } else e = a[b];
                    e = decodeURIComponent(e.replace(/\+/g, " "));
                    d = d || "";
                    this.add(e, decodeURIComponent(d.replace(/\+/g, " ")))
                }
        };
        goog.Uri.QueryData.prototype.keyMap_ = null;
        goog.Uri.QueryData.prototype.count_ = null;
        goog.Uri.QueryData.prototype.getCount = function() {
            this.ensureKeyMapInitialized_();
            return this.count_
        };
        goog.Uri.QueryData.prototype.add = function(a, b) {
            this.ensureKeyMapInitialized_();
            this.encodedQuery_ = null;
            var c = this.keyMap_.hasOwnProperty(a) && this.keyMap_[a];
            c || (this.keyMap_[a] = c = []);
            c.push(b);
            this.count_++;
            return this
        };
        goog.Uri.QueryData.prototype.toString = function() {
            if (this.encodedQuery_) return this.encodedQuery_;
            if (!this.keyMap_) return "";
            var a = [],
                b;
            for (b in this.keyMap_)
                for (var c = encodeURIComponent(b), d = this.keyMap_[b], e = 0; e < d.length; e++) {
                    var f = c;
                    "" !== d[e] && (f += "=" + encodeURIComponent(d[e]));
                    a.push(f)
                }
            return this.encodedQuery_ = a.join("&")
        };
        goog.Uri.QueryData.prototype.toDecodedString = function() {
            return goog.Uri.decodeOrEmpty_(this.toString())
        };
        goog.Uri.QueryData.prototype.clone = function() {
            var a = new goog.Uri.QueryData;
            a.encodedQuery_ = this.encodedQuery_;
            if (this.keyMap_) {
                var b = {},
                    c;
                for (c in this.keyMap_) b[c] = this.keyMap_[c].concat();
                a.keyMap_ = b;
                a.count_ = this.count_
            }
            return a
        };
        shaka.util.Functional = {};
        shaka.util.Functional.createFallbackPromiseChain = function(a, b) {
            return a.reduce(function(a, b, e) {
                return b["catch"](a.bind(null, e))
            }.bind(null, b), Promise.reject())
        };
        shaka.util.Functional.collapseArrays = function(a, b) {
            return a.concat(b)
        };
        shaka.util.Functional.noop = function() {};
        shaka.util.Functional.isNotNull = function(a) {
            return null != a
        };
        shaka.util.ManifestParserUtils = {};
        shaka.util.ManifestParserUtils.resolveUris = function(a, b) {
            var c = shaka.util.Functional;
            if (0 == b.length) return a;
            var d = b.map(function(a) {
                return new goog.Uri(a)
            });
            return a.map(function(a) {
                return new goog.Uri(a)
            }).map(function(a) {
                return d.map(a.resolve.bind(a))
            }).reduce(c.collapseArrays, []).map(function(a) {
                return a.toString()
            })
        };
        shaka.util.ManifestParserUtils.createDrmInfo = function(a, b) {
            return {
                keySystem: a,
                licenseServerUri: "",
                distinctiveIdentifierRequired: !1,
                persistentStateRequired: !1,
                audioRobustness: "",
                videoRobustness: "",
                serverCertificate: null,
                initData: b || [],
                keyIds: []
            }
        };
        shaka.util.ManifestParserUtils.ContentType = {
            VIDEO: "video",
            AUDIO: "audio",
            TEXT: "text",
            IMAGE: "image",
            APPLICATION: "application"
        };
        shaka.util.ManifestParserUtils.TextStreamKind = {
            SUBTITLE: "subtitle",
            CLOSED_CAPTION: "caption"
        };
        shaka.util.ManifestParserUtils.GAP_OVERLAP_TOLERANCE_SECONDS = 1 / 15;
        shaka.util.PublicPromise = function() {
            var a, b, c = new Promise(function(c, e) {
                a = c;
                b = e
            });
            c.resolve = a;
            c.reject = b;
            return c
        };
        shaka.util.PublicPromise.prototype.resolve = function(a) {};
        shaka.util.PublicPromise.prototype.reject = function(a) {};
        shaka.util.StringUtils = {};
        shaka.util.StringUtils.fromUTF8 = function(a) {
            if (!a) return "";
            a = new Uint8Array(a);
            239 == a[0] && 187 == a[1] && 191 == a[2] && (a = a.subarray(3));
            a = shaka.util.StringUtils.fromCharCode(a);
            a = escape(a);
            try {
                return decodeURIComponent(a)
            } catch (b) {
                throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.BAD_ENCODING);
            }
        };
        goog.exportSymbol("shaka.util.StringUtils.fromUTF8", shaka.util.StringUtils.fromUTF8);
        shaka.util.StringUtils.fromUTF16 = function(a, b, c) {
            if (!a) return "";
            if (!c && 0 != a.byteLength % 2) throw shaka.log.error("Data has an incorrect length, must be even."), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.BAD_ENCODING);
            if (a instanceof ArrayBuffer) var d = a;
            else c = new Uint8Array(a.byteLength), c.set(new Uint8Array(a)), d = c.buffer;
            a = Math.floor(a.byteLength / 2);
            c = new Uint16Array(a);
            d = new DataView(d);
            for (var e = 0; e < a; e++) c[e] = d.getUint16(2 * e, b);
            return shaka.util.StringUtils.fromCharCode(c)
        };
        goog.exportSymbol("shaka.util.StringUtils.fromUTF16", shaka.util.StringUtils.fromUTF16);
        shaka.util.StringUtils.fromBytesAutoDetect = function(a) {
            var b = shaka.util.StringUtils,
                c = new Uint8Array(a);
            if (239 == c[0] && 187 == c[1] && 191 == c[2]) return b.fromUTF8(c);
            if (254 == c[0] && 255 == c[1]) return b.fromUTF16(c.subarray(2), !1);
            if (255 == c[0] && 254 == c[1]) return b.fromUTF16(c.subarray(2), !0);
            var d = function(a, b) {
                return a.byteLength <= b || 32 <= a[b] && 126 >= a[b]
            }.bind(null, c);
            shaka.log.debug("Unable to find byte-order-mark, making an educated guess.");
            if (0 == c[0] && 0 == c[2]) return b.fromUTF16(a, !1);
            if (0 == c[1] && 0 == c[3]) return b.fromUTF16(a,
                !0);
            if (d(0) && d(1) && d(2) && d(3)) return b.fromUTF8(a);
            throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.UNABLE_TO_DETECT_ENCODING);
        };
        goog.exportSymbol("shaka.util.StringUtils.fromBytesAutoDetect", shaka.util.StringUtils.fromBytesAutoDetect);
        shaka.util.StringUtils.toUTF8 = function(a) {
            a = encodeURIComponent(a);
            a = unescape(a);
            for (var b = new Uint8Array(a.length), c = 0; c < a.length; ++c) b[c] = a.charCodeAt(c);
            return b.buffer
        };
        goog.exportSymbol("shaka.util.StringUtils.toUTF8", shaka.util.StringUtils.toUTF8);
        shaka.util.StringUtils.toUTF16 = function(a, b) {
            for (var c = new Uint8Array(2 * a.length), d = new DataView(c.buffer), e = 0; e < a.length; ++e) {
                var f = a.charCodeAt(e);
                d.setUint16(2 * e, f, b)
            }
            return c.buffer
        };
        goog.exportSymbol("shaka.util.StringUtils.toUTF16", shaka.util.StringUtils.toUTF16);
        shaka.util.StringUtils.fromCharCode = function(a) {
            if (!shaka.util.StringUtils.fromCharCodeImpl_)
                for (var b = function(a) {
                        try {
                            var b = new Uint8Array(a),
                                c = String.fromCharCode.apply(null, b);
                            goog.asserts.assert(c, "Should get value");
                            return 0 < c.length
                        } catch (g) {
                            return !1
                        }
                    }, c = {
                        size: 65536
                    }; 0 < c.size; c = {
                        size: c.size
                    }, c.size /= 2)
                    if (b(c.size)) {
                        shaka.util.StringUtils.fromCharCodeImpl_ = function(a) {
                            return function(b) {
                                for (var c = "", d = 0; d < b.length; d += a.size) {
                                    var e = b.subarray(d, d + a.size);
                                    c += String.fromCharCode.apply(null, e)
                                }
                                return c
                            }
                        }(c);
                        break
                    } goog.asserts.assert(shaka.util.StringUtils.fromCharCodeImpl_, "Unable to create a fromCharCode method");
            return shaka.util.StringUtils.fromCharCodeImpl_(a)
        };
        shaka.util.StringUtils.fromCharCodeImpl_ = null;
        shaka.util.StringUtils.resetFromCharCode = function() {
            shaka.util.StringUtils.fromCharCodeImpl_ = null
        };
        goog.exportSymbol("shaka.util.StringUtils.resetFromCharCode", shaka.util.StringUtils.resetFromCharCode);
        shaka.util.Uint8ArrayUtils = {};
        shaka.util.Uint8ArrayUtils.toBase64 = function(a, b) {
            var c = shaka.util.StringUtils.fromCharCode(a);
            b = void 0 == b ? !0 : b;
            c = window.btoa(c).replace(/\+/g, "-").replace(/\//g, "_");
            return b ? c : c.replace(/=*$/, "")
        };
        goog.exportSymbol("shaka.util.Uint8ArrayUtils.toBase64", shaka.util.Uint8ArrayUtils.toBase64);
        shaka.util.Uint8ArrayUtils.fromBase64 = function(a) {
            a = window.atob(a.replace(/-/g, "+").replace(/_/g, "/"));
            for (var b = new Uint8Array(a.length), c = 0; c < a.length; ++c) b[c] = a.charCodeAt(c);
            return b
        };
        goog.exportSymbol("shaka.util.Uint8ArrayUtils.fromBase64", shaka.util.Uint8ArrayUtils.fromBase64);
        shaka.util.Uint8ArrayUtils.fromHex = function(a) {
            for (var b = new Uint8Array(a.length / 2), c = 0; c < a.length; c += 2) b[c / 2] = window.parseInt(a.substr(c, 2), 16);
            return b
        };
        goog.exportSymbol("shaka.util.Uint8ArrayUtils.fromHex", shaka.util.Uint8ArrayUtils.fromHex);
        shaka.util.Uint8ArrayUtils.toHex = function(a) {
            for (var b = "", c = 0; c < a.length; ++c) {
                var d = a[c].toString(16);
                1 == d.length && (d = "0" + d);
                b += d
            }
            return b
        };
        goog.exportSymbol("shaka.util.Uint8ArrayUtils.toHex", shaka.util.Uint8ArrayUtils.toHex);
        shaka.util.Uint8ArrayUtils.equal = function(a, b) {
            if (!a && !b) return !0;
            if (!a || !b || a.length != b.length) return !1;
            for (var c = 0; c < a.length; ++c)
                if (a[c] != b[c]) return !1;
            return !0
        };
        goog.exportSymbol("shaka.util.Uint8ArrayUtils.equal", shaka.util.Uint8ArrayUtils.equal);
        shaka.util.Uint8ArrayUtils.concat = function(a) {
            for (var b = [], c = 0; c < arguments.length; ++c) b[c - 0] = arguments[c];
            for (var d = c = 0; d < b.length; ++d) c += b[d].length;
            c = new Uint8Array(c);
            for (var e = d = 0; e < b.length; ++e) c.set(b[e], d), d += b[e].length;
            return c
        };
        goog.exportSymbol("shaka.util.Uint8ArrayUtils.concat", shaka.util.Uint8ArrayUtils.concat);
        shaka.media = {};
        shaka.media.Transmuxer = function() {
            this.muxTransmuxer_ = new muxjs.mp4.Transmuxer({
                keepOriginalTimestamps: !0
            });
            this.transmuxPromise_ = null;
            this.transmuxedData_ = [];
            this.captions_ = [];
            this.isTransmuxing_ = !1;
            this.muxTransmuxer_.on("data", this.onTransmuxed_.bind(this));
            this.muxTransmuxer_.on("done", this.onTransmuxDone_.bind(this))
        };
        shaka.media.Transmuxer.prototype.destroy = function() {
            this.muxTransmuxer_.dispose();
            this.muxTransmuxer_ = null;
            return Promise.resolve()
        };
        shaka.media.Transmuxer.isSupported = function(a, b) {
            if (!window.muxjs || !shaka.media.Transmuxer.isTsContainer(a)) return !1;
            var c = shaka.media.Transmuxer.convertTsCodecs;
            if (b) return MediaSource.isTypeSupported(c(b, a));
            var d = shaka.util.ManifestParserUtils.ContentType;
            return MediaSource.isTypeSupported(c(d.AUDIO, a)) || MediaSource.isTypeSupported(c(d.VIDEO, a))
        };
        shaka.media.Transmuxer.isTsContainer = function(a) {
            return "mp2t" == a.toLowerCase().split(";")[0].split("/")[1]
        };
        shaka.media.Transmuxer.convertTsCodecs = function(a, b) {
            var c = shaka.util.ManifestParserUtils.ContentType,
                d = b.replace(/mp2t/i, "mp4");
            a == c.AUDIO && (d = d.replace("video", "audio"));
            if (c = /avc1\.(66|77|100)\.(\d+)/.exec(d)) {
                var e = "avc1.",
                    f = c[1];
                "66" == f ? e += "4200" : "77" == f ? e += "4d00" : (goog.asserts.assert("100" == f, "Legacy avc1 parsing code out of sync with regex!"), e += "6400");
                f = Number(c[2]);
                goog.asserts.assert(256 > f, "Invalid legacy avc1 level number!");
                e += (f >> 4).toString(16);
                e += (f & 15).toString(16);
                d = d.replace(c[0],
                    e)
            }
            return d
        };
        shaka.media.Transmuxer.prototype.transmux = function(a) {
            goog.asserts.assert(!this.isTransmuxing_, "No transmuxing should be in progress.");
            this.isTransmuxing_ = !0;
            this.transmuxPromise_ = new shaka.util.PublicPromise;
            this.transmuxedData_ = [];
            this.captions_ = [];
            a = new Uint8Array(a);
            this.muxTransmuxer_.push(a);
            this.muxTransmuxer_.flush();
            this.isTransmuxing_ && this.transmuxPromise_.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.TRANSMUXING_FAILED));
            return this.transmuxPromise_
        };
        shaka.media.Transmuxer.prototype.onTransmuxed_ = function(a) {
            this.captions_ = a.captions;
            var b = new Uint8Array(a.data.byteLength + a.initSegment.byteLength);
            b.set(a.initSegment, 0);
            b.set(a.data, a.initSegment.byteLength);
            this.transmuxedData_.push(b)
        };
        shaka.media.Transmuxer.prototype.onTransmuxDone_ = function() {
            var a = {
                data: shaka.util.Uint8ArrayUtils.concat.apply(null, this.transmuxedData_),
                captions: this.captions_
            };
            this.transmuxPromise_.resolve(a);
            this.isTransmuxing_ = !1
        };
        shaka.util.DelayedTick = function(a) {
            this.onTick_ = a;
            this.cancelPending_ = null
        };
        shaka.util.DelayedTick.prototype.tickAfter = function(a) {
            var b = this;
            this.stop();
            var c = !0,
                d = null;
            this.cancelPending_ = function() {
                window.clearTimeout(d);
                c = !1
            };
            d = window.setTimeout(function() {
                if (c) b.onTick_()
            }, 1E3 * a);
            return this
        };
        shaka.util.DelayedTick.prototype.stop = function() {
            this.cancelPending_ && (this.cancelPending_(), this.cancelPending_ = null)
        };
        shaka.util.Timer = function(a) {
            this.onTick_ = a;
            this.ticker_ = null
        };
        goog.exportSymbol("shaka.util.Timer", shaka.util.Timer);
        shaka.util.Timer.prototype.tickNow = function() {
            this.stop();
            this.onTick_();
            return this
        };
        goog.exportProperty(shaka.util.Timer.prototype, "tickNow", shaka.util.Timer.prototype.tickNow);
        shaka.util.Timer.prototype.tickAfter = function(a) {
            var b = this;
            this.stop();
            this.ticker_ = (new shaka.util.DelayedTick(function() {
                b.onTick_()
            })).tickAfter(a);
            return this
        };
        goog.exportProperty(shaka.util.Timer.prototype, "tickAfter", shaka.util.Timer.prototype.tickAfter);
        shaka.util.Timer.prototype.tickEvery = function(a) {
            var b = this;
            this.stop();
            this.ticker_ = (new shaka.util.DelayedTick(function() {
                b.ticker_.tickAfter(a);
                b.onTick_()
            })).tickAfter(a);
            return this
        };
        goog.exportProperty(shaka.util.Timer.prototype, "tickEvery", shaka.util.Timer.prototype.tickEvery);
        shaka.util.Timer.prototype.stop = function() {
            this.ticker_ && (this.ticker_.stop(), this.ticker_ = null)
        };
        goog.exportProperty(shaka.util.Timer.prototype, "stop", shaka.util.Timer.prototype.stop);
        shaka.net = {};
        shaka.net.Backoff = function(a, b) {
            b = void 0 === b ? !1 : b;
            var c = shaka.net.Backoff.defaultRetryParameters();
            this.maxAttempts_ = null == a.maxAttempts ? c.maxAttempts : a.maxAttempts;
            goog.asserts.assert(1 <= this.maxAttempts_, "maxAttempts should be >= 1");
            this.baseDelay_ = null == a.baseDelay ? c.baseDelay : a.baseDelay;
            goog.asserts.assert(0 <= this.baseDelay_, "baseDelay should be >= 0");
            this.fuzzFactor_ = null == a.fuzzFactor ? c.fuzzFactor : a.fuzzFactor;
            goog.asserts.assert(0 <= this.fuzzFactor_, "fuzzFactor should be >= 0");
            this.backoffFactor_ =
                null == a.backoffFactor ? c.backoffFactor : a.backoffFactor;
            goog.asserts.assert(0 <= this.backoffFactor_, "backoffFactor should be >= 0");
            this.numAttempts_ = 0;
            this.nextUnfuzzedDelay_ = this.baseDelay_;
            if (this.autoReset_ = b) goog.asserts.assert(2 <= this.maxAttempts_, "maxAttempts must be >= 2 for autoReset == true"), this.numAttempts_ = 1
        };
        shaka.net.Backoff.prototype.attempt = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            if (a.numAttempts_ >= a.maxAttempts_)
                                if (a.autoReset_) a.reset_();
                                else return c["return"](Promise.reject());
                            d = a.numAttempts_;
                            a.numAttempts_++;
                            if (0 == d) return goog.asserts.assert(!a.autoReset_, "Failed to delay with auto-reset!"), c["return"]();
                            e = shaka.net.Backoff.fuzz_(a.nextUnfuzzedDelay_, a.fuzzFactor_);
                            return c.yield(new Promise(function(a) {
                                shaka.net.Backoff.defer(e, a)
                            }), 2);
                        case 2:
                            a.nextUnfuzzedDelay_ *= a.backoffFactor_, c.jumpToEnd()
                    }
                })
            })
        };
        shaka.net.Backoff.defaultRetryParameters = function() {
            return {
                maxAttempts: 2,
                baseDelay: 1E3,
                backoffFactor: 2,
                fuzzFactor: .5,
                timeout: 0
            }
        };
        shaka.net.Backoff.fuzz_ = function(a, b) {
            return a * (1 + (2 * Math.random() - 1) * b)
        };
        shaka.net.Backoff.prototype.reset_ = function() {
            goog.asserts.assert(this.autoReset_, "Should only be used for auto-reset!");
            this.numAttempts_ = 1;
            this.nextUnfuzzedDelay_ = this.baseDelay_
        };
        shaka.net.Backoff.defer = function(a, b) {
            (new shaka.util.Timer(b)).tickAfter(a / 1E3)
        };
        shaka.util.AbortableOperation = function(a, b) {
            this.promise = a;
            this.onAbort_ = b;
            this.aborted_ = !1
        };
        goog.exportSymbol("shaka.util.AbortableOperation", shaka.util.AbortableOperation);
        shaka.util.AbortableOperation.failed = function(a) {
            return new shaka.util.AbortableOperation(Promise.reject(a), function() {
                return Promise.resolve()
            })
        };
        goog.exportProperty(shaka.util.AbortableOperation, "failed", shaka.util.AbortableOperation.failed);
        shaka.util.AbortableOperation.aborted = function() {
            var a = Promise.reject(shaka.util.AbortableOperation.abortError());
            a["catch"](function() {});
            return new shaka.util.AbortableOperation(a, function() {
                return Promise.resolve()
            })
        };
        goog.exportProperty(shaka.util.AbortableOperation, "aborted", shaka.util.AbortableOperation.aborted);
        shaka.util.AbortableOperation.abortError = function() {
            return new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.OPERATION_ABORTED)
        };
        shaka.util.AbortableOperation.completed = function(a) {
            return new shaka.util.AbortableOperation(Promise.resolve(a), function() {
                return Promise.resolve()
            })
        };
        goog.exportProperty(shaka.util.AbortableOperation, "completed", shaka.util.AbortableOperation.completed);
        shaka.util.AbortableOperation.notAbortable = function(a) {
            return new shaka.util.AbortableOperation(a, function() {
                return a["catch"](function() {})
            })
        };
        goog.exportProperty(shaka.util.AbortableOperation, "notAbortable", shaka.util.AbortableOperation.notAbortable);
        shaka.util.AbortableOperation.prototype.abort = function() {
            this.aborted_ = !0;
            return this.onAbort_()
        };
        goog.exportProperty(shaka.util.AbortableOperation.prototype, "abort", shaka.util.AbortableOperation.prototype.abort);
        shaka.util.AbortableOperation.all = function(a) {
            return new shaka.util.AbortableOperation(Promise.all(a.map(function(a) {
                return a.promise
            })), function() {
                return Promise.all(a.map(function(a) {
                    return a.abort()
                }))
            })
        };
        goog.exportProperty(shaka.util.AbortableOperation, "all", shaka.util.AbortableOperation.all);
        shaka.util.AbortableOperation.prototype["finally"] = function(a) {
            this.promise.then(function(b) {
                return a(!0)
            }, function(b) {
                return a(!1)
            });
            return this
        };
        goog.exportProperty(shaka.util.AbortableOperation.prototype, "finally", shaka.util.AbortableOperation.prototype["finally"]);
        shaka.util.AbortableOperation.prototype.chain = function(a, b) {
            var c = this,
                d = new shaka.util.PublicPromise,
                e = shaka.util.AbortableOperation.abortError(),
                f = function() {
                    d.reject(e);
                    return c.abort()
                },
                g = function(g) {
                    return function(h) {
                        if (c.aborted_ && g) d.reject(e);
                        else {
                            var k = g ? a : b;
                            k ? f = shaka.util.AbortableOperation.wrapChainCallback_(k, h, d) : (g ? d.resolve : d.reject)(h)
                        }
                    }
                };
            this.promise.then(g(!0), g(!1));
            return new shaka.util.AbortableOperation(d, function() {
                return f()
            })
        };
        goog.exportProperty(shaka.util.AbortableOperation.prototype, "chain", shaka.util.AbortableOperation.prototype.chain);
        shaka.util.AbortableOperation.wrapChainCallback_ = function(a, b, c) {
            try {
                var d = a(b);
                if (d && d.promise && d.abort) return c.resolve(d.promise),
                    function() {
                        return d.abort()
                    };
                c.resolve(d);
                return function() {
                    return Promise.resolve(d).then(function() {}, function() {})
                }
            } catch (e) {
                return c.reject(e),
                    function() {
                        return Promise.resolve()
                    }
            }
        };
        shaka.util.FakeEvent = function(a, b) {
            b = void 0 === b ? {} : b;
            for (var c in b) this[c] = b[c];
            this.defaultPrevented = this.cancelable = this.bubbles = !1;
            this.timeStamp = window.performance && window.performance.now ? window.performance.now() : Date.now();
            this.type = a;
            this.isTrusted = !1;
            this.target = this.currentTarget = null;
            this.stopped = !1
        };
        goog.exportSymbol("shaka.util.FakeEvent", shaka.util.FakeEvent);
        shaka.util.FakeEvent.prototype.preventDefault = function() {
            this.cancelable && (this.defaultPrevented = !0)
        };
        shaka.util.FakeEvent.prototype.stopImmediatePropagation = function() {
            this.stopped = !0
        };
        shaka.util.FakeEvent.prototype.stopPropagation = function() {};
        shaka.util.MultiMap = function() {
            this.map_ = {}
        };
        shaka.util.MultiMap.prototype.push = function(a, b) {
            this.map_.hasOwnProperty(a) ? this.map_[a].push(b) : this.map_[a] = [b]
        };
        shaka.util.MultiMap.prototype.get = function(a) {
            return (a = this.map_[a]) ? a.slice() : null
        };
        shaka.util.MultiMap.prototype.getAll = function() {
            var a = [],
                b;
            for (b in this.map_) a.push.apply(a, this.map_[b]);
            return a
        };
        shaka.util.MultiMap.prototype.remove = function(a, b) {
            var c = this.map_[a];
            if (c)
                for (var d = 0; d < c.length; ++d) c[d] == b && (c.splice(d, 1), --d)
        };
        shaka.util.MultiMap.prototype.clear = function() {
            this.map_ = {}
        };
        shaka.util.MultiMap.prototype.forEach = function(a) {
            for (var b in this.map_) a(b, this.map_[b])
        };
        shaka.util.FakeEventTarget = function() {
            this.listeners_ = new shaka.util.MultiMap;
            this.dispatchTarget = this
        };
        shaka.util.FakeEventTarget.prototype.addEventListener = function(a, b, c) {
            this.listeners_.push(a, b)
        };
        shaka.util.FakeEventTarget.prototype.removeEventListener = function(a, b, c) {
            this.listeners_.remove(a, b)
        };
        shaka.util.FakeEventTarget.prototype.dispatchEvent = function(a) {
            goog.asserts.assert(a instanceof shaka.util.FakeEvent, "FakeEventTarget can only dispatch FakeEvents!");
            for (var b = this.listeners_.get(a.type) || [], c = 0; c < b.length; ++c) {
                a.target = this.dispatchTarget;
                a.currentTarget = this.dispatchTarget;
                var d = b[c];
                try {
                    d.handleEvent ? d.handleEvent(a) : d.call(this, a)
                } catch (e) {
                    shaka.log.error("Uncaught exception in event handler", e, e ? e.message : null, e ? e.stack : null)
                }
                if (a.stopped) break
            }
            return a.defaultPrevented
        };
        shaka.util.ObjectUtils = function() {};
        shaka.util.ObjectUtils.cloneObject = function(a) {
            var b = new Set,
                c = function(a) {
                    switch (typeof a) {
                        case "undefined":
                        case "boolean":
                        case "number":
                        case "string":
                        case "symbol":
                        case "function":
                            return a;
                        default:
                            if (!a || a.buffer && a.buffer.constructor == ArrayBuffer) return a;
                            if (b.has(a)) return null;
                            var d = a.constructor == Array;
                            if (a.constructor != Object && !d) return null;
                            b.add(a);
                            var f = d ? [] : {},
                                g;
                            for (g in a) f[g] = c(a[g]);
                            d && (f.length = a.length);
                            return f
                    }
                };
            return c(a)
        };
        shaka.util.ArrayUtils = {};
        shaka.util.ArrayUtils.defaultEquals = function(a, b) {
            return "number" === typeof a && "number" === typeof b && isNaN(a) && isNaN(b) ? !0 : a === b
        };
        shaka.util.ArrayUtils.remove = function(a, b) {
            var c = a.indexOf(b); - 1 < c && a.splice(c, 1)
        };
        shaka.util.ArrayUtils.count = function(a, b) {
            var c = 0;
            a.forEach(function(a) {
                c += b(a) ? 1 : 0
            });
            return c
        };
        shaka.util.ArrayUtils.hasSameElements = function(a, b, c) {
            c || (c = shaka.util.ArrayUtils.defaultEquals);
            if (a.length != b.length) return !1;
            b = b.slice();
            var d = {};
            a = $jscomp.makeIterator(a);
            for (var e = a.next(); !e.done; d = {
                    item: d.item
                }, e = a.next()) {
                d.item = e.value;
                e = b.findIndex(function(a) {
                    return function(b) {
                        return c(a.item, b)
                    }
                }(d));
                if (-1 == e) return !1;
                b[e] = b[b.length - 1];
                b.pop()
            }
            return 0 == b.length
        };
        shaka.util.ArrayUtils.equal = function(a, b, c) {
            c || (c = shaka.util.ArrayUtils.defaultEquals);
            if (a.length != b.length) return !1;
            for (var d = 0; d < a.length; d++)
                if (!c(a[d], b[d])) return !1;
            return !0
        };
        shaka.util.OperationManager = function() {
            this.operations_ = []
        };
        shaka.util.OperationManager.prototype.manage = function(a) {
            var b = this;
            this.operations_.push(a["finally"](function() {
                shaka.util.ArrayUtils.remove(b.operations_, a)
            }))
        };
        shaka.util.OperationManager.prototype.destroy = function() {
            var a = [];
            this.operations_.forEach(function(b) {
                b.promise["catch"](function() {});
                a.push(b.abort())
            });
            this.operations_ = [];
            return Promise.all(a)
        };
        shaka.net.NetworkingEngine = function(a) {
            shaka.util.FakeEventTarget.call(this);
            this.destroyed_ = !1;
            this.operationManager_ = new shaka.util.OperationManager;
            this.requestFilters_ = new Set;
            this.responseFilters_ = new Set;
            this.onProgressUpdated_ = a || null
        };
        goog.inherits(shaka.net.NetworkingEngine, shaka.util.FakeEventTarget);
        goog.exportSymbol("shaka.net.NetworkingEngine", shaka.net.NetworkingEngine);
        shaka.net.NetworkingEngine.RequestType = {
            MANIFEST: 0,
            SEGMENT: 1,
            LICENSE: 2,
            APP: 3,
            TIMING: 4
        };
        goog.exportProperty(shaka.net.NetworkingEngine, "RequestType", shaka.net.NetworkingEngine.RequestType);
        shaka.net.NetworkingEngine.PluginPriority = {
            FALLBACK: 1,
            PREFERRED: 2,
            APPLICATION: 3
        };
        goog.exportProperty(shaka.net.NetworkingEngine, "PluginPriority", shaka.net.NetworkingEngine.PluginPriority);
        shaka.net.NetworkingEngine.schemes_ = {};
        shaka.net.NetworkingEngine.registerScheme = function(a, b, c) {
            goog.asserts.assert(void 0 == c || 0 < c, "explicit priority must be > 0");
            c = c || shaka.net.NetworkingEngine.PluginPriority.APPLICATION;
            var d = shaka.net.NetworkingEngine.schemes_[a];
            if (!d || c >= d.priority) shaka.net.NetworkingEngine.schemes_[a] = {
                priority: c,
                plugin: b
            }
        };
        goog.exportProperty(shaka.net.NetworkingEngine, "registerScheme", shaka.net.NetworkingEngine.registerScheme);
        shaka.net.NetworkingEngine.unregisterScheme = function(a) {
            delete shaka.net.NetworkingEngine.schemes_[a]
        };
        goog.exportProperty(shaka.net.NetworkingEngine, "unregisterScheme", shaka.net.NetworkingEngine.unregisterScheme);
        shaka.net.NetworkingEngine.prototype.registerRequestFilter = function(a) {
            this.requestFilters_.add(a)
        };
        goog.exportProperty(shaka.net.NetworkingEngine.prototype, "registerRequestFilter", shaka.net.NetworkingEngine.prototype.registerRequestFilter);
        shaka.net.NetworkingEngine.prototype.unregisterRequestFilter = function(a) {
            this.requestFilters_["delete"](a)
        };
        goog.exportProperty(shaka.net.NetworkingEngine.prototype, "unregisterRequestFilter", shaka.net.NetworkingEngine.prototype.unregisterRequestFilter);
        shaka.net.NetworkingEngine.prototype.clearAllRequestFilters = function() {
            this.requestFilters_.clear()
        };
        goog.exportProperty(shaka.net.NetworkingEngine.prototype, "clearAllRequestFilters", shaka.net.NetworkingEngine.prototype.clearAllRequestFilters);
        shaka.net.NetworkingEngine.prototype.registerResponseFilter = function(a) {
            this.responseFilters_.add(a)
        };
        goog.exportProperty(shaka.net.NetworkingEngine.prototype, "registerResponseFilter", shaka.net.NetworkingEngine.prototype.registerResponseFilter);
        shaka.net.NetworkingEngine.prototype.unregisterResponseFilter = function(a) {
            this.responseFilters_["delete"](a)
        };
        goog.exportProperty(shaka.net.NetworkingEngine.prototype, "unregisterResponseFilter", shaka.net.NetworkingEngine.prototype.unregisterResponseFilter);
        shaka.net.NetworkingEngine.prototype.clearAllResponseFilters = function() {
            this.responseFilters_.clear()
        };
        goog.exportProperty(shaka.net.NetworkingEngine.prototype, "clearAllResponseFilters", shaka.net.NetworkingEngine.prototype.clearAllResponseFilters);
        shaka.net.NetworkingEngine.defaultRetryParameters = function() {
            return shaka.net.Backoff.defaultRetryParameters()
        };
        goog.exportProperty(shaka.net.NetworkingEngine, "defaultRetryParameters", shaka.net.NetworkingEngine.defaultRetryParameters);
        shaka.net.NetworkingEngine.makeRequest = function(a, b) {
            return {
                uris: a,
                method: "GET",
                body: null,
                headers: {},
                allowCrossSiteCredentials: !1,
                retryParameters: b,
                licenseRequestType: null,
                sessionId: null
            }
        };
        goog.exportProperty(shaka.net.NetworkingEngine, "makeRequest", shaka.net.NetworkingEngine.makeRequest);
        shaka.net.NetworkingEngine.prototype.destroy = function() {
            this.destroyed_ = !0;
            this.requestFilters_.clear();
            this.responseFilters_.clear();
            return this.operationManager_.destroy()
        };
        goog.exportProperty(shaka.net.NetworkingEngine.prototype, "destroy", shaka.net.NetworkingEngine.prototype.destroy);
        shaka.net.NetworkingEngine.prototype.request = function(a, b) {
            var c = this,
                d = shaka.util.ObjectUtils,
                e = new shaka.net.NetworkingEngine.NumBytesRemainingClass;
            if (this.destroyed_) return d = Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.OPERATION_ABORTED)), d["catch"](function() {}), new shaka.net.NetworkingEngine.PendingRequest(d, function() {
                return Promise.resolve()
            }, e);
            goog.asserts.assert(b.uris && b.uris.length, "Request without URIs!");
            b.method = b.method || "GET";
            b.headers = b.headers || {};
            b.retryParameters = b.retryParameters ? d.cloneObject(b.retryParameters) : shaka.net.NetworkingEngine.defaultRetryParameters();
            b.uris = d.cloneObject(b.uris);
            d = this.filterRequest_(a, b);
            var f = d.chain(function() {
                    return c.makeRequestWithRetry_(a, b, e)
                }),
                g = f.chain(function(b) {
                    return c.filterResponse_(a, b)
                }),
                h = Date.now(),
                k = 0;
            d.promise.then(function() {
                k = Date.now() - h
            }, function() {});
            var l = 0;
            f.promise.then(function() {
                l = Date.now()
            }, function() {});
            d = g.chain(function(b) {
                var d =
                    Date.now() - l,
                    e = b.response;
                e.timeMs += k;
                e.timeMs += d;
                if (!b.gotProgress && c.onProgressUpdated_ && !e.fromCache && a == shaka.net.NetworkingEngine.RequestType.SEGMENT) c.onProgressUpdated_(e.timeMs, e.data.byteLength);
                return e
            }, function(a) {
                a && (goog.asserts.assert(a instanceof shaka.util.Error, "Wrong error type"), a.severity = shaka.util.Error.Severity.CRITICAL);
                throw a;
            });
            d = new shaka.net.NetworkingEngine.PendingRequest(d.promise, d.onAbort_, e);
            this.operationManager_.manage(d);
            return d
        };
        goog.exportProperty(shaka.net.NetworkingEngine.prototype, "request", shaka.net.NetworkingEngine.prototype.request);
        shaka.net.NetworkingEngine.prototype.filterRequest_ = function(a, b) {
            for (var c = shaka.util.AbortableOperation.completed(void 0), d = {}, e = $jscomp.makeIterator(this.requestFilters_), f = e.next(); !f.done; d = {
                    requestFilter: d.requestFilter
                }, f = e.next()) d.requestFilter = f.value, c = c.chain(function(c) {
                return function() {
                    return c.requestFilter(a, b)
                }
            }(d));
            return c.chain(void 0, function(a) {
                if (a && a.code == shaka.util.Error.Code.OPERATION_ABORTED) throw a;
                throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.NETWORK,
                    shaka.util.Error.Code.REQUEST_FILTER_ERROR, a);
            })
        };
        shaka.net.NetworkingEngine.prototype.makeRequestWithRetry_ = function(a, b, c) {
            var d = new shaka.net.Backoff(b.retryParameters, !1);
            return this.send_(a, b, d, 0, null, c)
        };
        shaka.net.NetworkingEngine.prototype.send_ = function(a, b, c, d, e, f) {
            var g = this,
                h = new goog.Uri(b.uris[d]),
                k = h.getScheme(),
                l = !1;
            k || (k = shaka.net.NetworkingEngine.getLocationProtocol_(), goog.asserts.assert(":" == k[k.length - 1], "location.protocol expected to end with a colon!"), k = k.slice(0, -1), h.setScheme(k), b.uris[d] = h.toString());
            k = k.toLowerCase();
            var m = (k = shaka.net.NetworkingEngine.schemes_[k]) ? k.plugin : null;
            if (!m) return shaka.util.AbortableOperation.failed(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.UNSUPPORTED_SCHEME, h));
            var n;
            return shaka.util.AbortableOperation.notAbortable(c.attempt()).chain(function() {
                if (g.destroyed_) return shaka.util.AbortableOperation.aborted();
                n = Date.now();
                var c = shaka.net.NetworkingEngine.RequestType.SEGMENT;
                return m(b.uris[d], b, a, function(b, d, e) {
                    g.onProgressUpdated_ && a == c && (g.onProgressUpdated_(b, d), l = !0, f.setBytes(e))
                })
            }).chain(function(a) {
                    void 0 == a.timeMs && (a.timeMs = Date.now() - n);
                    return {
                        response: a,
                        gotProgress: l
                    }
                },
                function(h) {
                    if (h && h.code == shaka.util.Error.Code.OPERATION_ABORTED) throw h;
                    if (g.destroyed_) return shaka.util.AbortableOperation.aborted();
                    if (h && h.severity == shaka.util.Error.Severity.RECOVERABLE) {
                        var k = new shaka.util.FakeEvent("retry", {
                            error: h instanceof shaka.util.Error ? h : null
                        });
                        g.dispatchEvent(k);
                        d = (d + 1) % b.uris.length;
                        return g.send_(a, b, c, d, h, f)
                    }
                    throw h || e;
                })
        };
        shaka.net.NetworkingEngine.prototype.filterResponse_ = function(a, b) {
            for (var c = shaka.util.AbortableOperation.completed(void 0), d = $jscomp.makeIterator(this.responseFilters_), e = d.next(); !e.done; e = d.next()) c = c.chain(e.value.bind(null, a, b.response));
            return c.chain(function() {
                return b
            }, function(a) {
                if (a && a.code == shaka.util.Error.Code.OPERATION_ABORTED) throw a;
                var b = shaka.util.Error.Severity.CRITICAL;
                a instanceof shaka.util.Error && (b = a.severity);
                throw new shaka.util.Error(b, shaka.util.Error.Category.NETWORK,
                    shaka.util.Error.Code.RESPONSE_FILTER_ERROR, a);
            })
        };
        shaka.net.NetworkingEngine.getLocationProtocol_ = function() {
            return location.protocol
        };
        shaka.net.NetworkingEngine.NumBytesRemainingClass = function() {
            this.bytesToLoad_ = 0
        };
        goog.exportProperty(shaka.net.NetworkingEngine, "NumBytesRemainingClass", shaka.net.NetworkingEngine.NumBytesRemainingClass);
        shaka.net.NetworkingEngine.NumBytesRemainingClass.prototype.setBytes = function(a) {
            this.bytesToLoad_ = a
        };
        shaka.net.NetworkingEngine.NumBytesRemainingClass.prototype.getBytes = function() {
            return this.bytesToLoad_
        };
        shaka.net.NetworkingEngine.PendingRequest = function(a, b, c) {
            shaka.util.AbortableOperation.call(this, a, b);
            this.bytesRemaining_ = c
        };
        $jscomp.inherits(shaka.net.NetworkingEngine.PendingRequest, shaka.util.AbortableOperation);
        goog.exportProperty(shaka.net.NetworkingEngine, "PendingRequest", shaka.net.NetworkingEngine.PendingRequest);
        shaka.net.NetworkingEngine.PendingRequest.wrapChainCallback_ = shaka.util.AbortableOperation.wrapChainCallback_;
        shaka.net.NetworkingEngine.PendingRequest.all = shaka.util.AbortableOperation.all;
        goog.exportProperty(shaka.net.NetworkingEngine.PendingRequest, "all", shaka.net.NetworkingEngine.PendingRequest.all);
        shaka.net.NetworkingEngine.PendingRequest.notAbortable = shaka.util.AbortableOperation.notAbortable;
        goog.exportProperty(shaka.net.NetworkingEngine.PendingRequest, "notAbortable", shaka.net.NetworkingEngine.PendingRequest.notAbortable);
        shaka.net.NetworkingEngine.PendingRequest.completed = shaka.util.AbortableOperation.completed;
        goog.exportProperty(shaka.net.NetworkingEngine.PendingRequest, "completed", shaka.net.NetworkingEngine.PendingRequest.completed);
        shaka.net.NetworkingEngine.PendingRequest.abortError = shaka.util.AbortableOperation.abortError;
        shaka.net.NetworkingEngine.PendingRequest.aborted = shaka.util.AbortableOperation.aborted;
        goog.exportProperty(shaka.net.NetworkingEngine.PendingRequest, "aborted", shaka.net.NetworkingEngine.PendingRequest.aborted);
        shaka.net.NetworkingEngine.PendingRequest.failed = shaka.util.AbortableOperation.failed;
        goog.exportProperty(shaka.net.NetworkingEngine.PendingRequest, "failed", shaka.net.NetworkingEngine.PendingRequest.failed);
        shaka.net.NetworkingEngine.PendingRequest.prototype.getBytesRemaining = function() {
            return this.bytesRemaining_.getBytes()
        };
        shaka.util.IReleasable = function() {};
        goog.exportSymbol("shaka.util.IReleasable", shaka.util.IReleasable);
        shaka.util.IReleasable.prototype.release = function() {};
        shaka.util.EventManager = function() {
            this.bindingMap_ = new shaka.util.MultiMap
        };
        goog.exportSymbol("shaka.util.EventManager", shaka.util.EventManager);
        shaka.util.EventManager.prototype.release = function() {
            this.removeAll();
            this.bindingMap_ = null
        };
        goog.exportProperty(shaka.util.EventManager.prototype, "release", shaka.util.EventManager.prototype.release);
        shaka.util.EventManager.prototype.listen = function(a, b, c, d) {
            this.bindingMap_ && (a = new shaka.util.EventManager.Binding_(a, b, c, d), this.bindingMap_.push(b, a))
        };
        goog.exportProperty(shaka.util.EventManager.prototype, "listen", shaka.util.EventManager.prototype.listen);
        shaka.util.EventManager.prototype.listenOnce = function(a, b, c, d) {
            var e = this,
                f = function(d) {
                    e.unlisten(a, b, f);
                    c(d)
                };
            this.listen(a, b, f, d)
        };
        goog.exportProperty(shaka.util.EventManager.prototype, "listenOnce", shaka.util.EventManager.prototype.listenOnce);
        shaka.util.EventManager.prototype.unlisten = function(a, b, c) {
            if (this.bindingMap_) {
                var d = this.bindingMap_.get(b) || [];
                d = $jscomp.makeIterator(d);
                for (var e = d.next(); !e.done; e = d.next()) e = e.value, e.target != a || c != e.listener && c || (e.unlisten(), this.bindingMap_.remove(b, e))
            }
        };
        goog.exportProperty(shaka.util.EventManager.prototype, "unlisten", shaka.util.EventManager.prototype.unlisten);
        shaka.util.EventManager.prototype.removeAll = function() {
            if (this.bindingMap_) {
                var a = this.bindingMap_.getAll();
                a = $jscomp.makeIterator(a);
                for (var b = a.next(); !b.done; b = a.next()) b.value.unlisten();
                this.bindingMap_.clear()
            }
        };
        goog.exportProperty(shaka.util.EventManager.prototype, "removeAll", shaka.util.EventManager.prototype.removeAll);
        shaka.util.EventManager.Binding_ = function(a, b, c, d) {
            this.target = a;
            this.type = b;
            this.listener = c;
            this.options = shaka.util.EventManager.Binding_.convertOptions_(a, d);
            this.target.addEventListener(b, c, this.options)
        };
        shaka.util.EventManager.Binding_.prototype.unlisten = function() {
            goog.asserts.assert(this.target, "Missing target");
            this.target.removeEventListener(this.type, this.listener, this.options);
            this.listener = this.target = null;
            this.options = !1
        };
        goog.exportProperty(shaka.util.EventManager.Binding_.prototype, "unlisten", shaka.util.EventManager.Binding_.prototype.unlisten);
        shaka.util.EventManager.Binding_.convertOptions_ = function(a, b) {
            if (void 0 == b) return !1;
            if ("boolean" == typeof b) return b;
            var c = new Set(["passive", "capture"]),
                d = Object.keys(b).filter(function(a) {
                    return !c.has(a)
                });
            goog.asserts.assert(0 == d.length, "Unsupported flag(s) to addEventListener: " + d.join(","));
            return shaka.util.EventManager.Binding_.doesSupportObject_(a) ? b : b.capture || !1
        };
        shaka.util.EventManager.Binding_.doesSupportObject_ = function(a) {
            var b = shaka.util.EventManager.Binding_.supportsObject_;
            if (void 0 == b) {
                b = !1;
                try {
                    var c = {},
                        d = {
                            get: function() {
                                b = !0;
                                return !1
                            }
                        };
                    Object.defineProperty(c, "passive", d);
                    Object.defineProperty(c, "capture", d);
                    d = function() {};
                    a.addEventListener("test", d, c);
                    a.removeEventListener("test", d, c)
                } catch (e) {
                    b = !1
                }
                shaka.util.EventManager.Binding_.supportsObject_ = b
            }
            return b || !1
        };
        shaka.util.EventManager.Binding_.supportsObject_ = void 0;
        shaka.util.FairPlayUtils = function() {};
        shaka.util.FairPlayUtils.defaultGetContentId = function(a) {
            a = shaka.util.StringUtils.fromBytesAutoDetect(a);
            return (new goog.Uri(a)).getDomain()
        };
        goog.exportSymbol("shaka.util.FairPlayUtils.defaultGetContentId", shaka.util.FairPlayUtils.defaultGetContentId);
        shaka.util.FairPlayUtils.initDataTransform = function(a, b, c) {
            if (!c || !c.byteLength) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.SERVER_CERTIFICATE_REQUIRED);
            b = "string" == typeof b ? new Uint8Array(shaka.util.StringUtils.toUTF16(b, !0)) : new Uint8Array(b);
            a = shaka.util.StringUtils.fromBytesAutoDetect(a);
            a = shaka.util.StringUtils.toUTF16(a, !0);
            var d = new Uint8Array(12 + a.byteLength + b.byteLength + c.byteLength),
                e = 0,
                f = function(a) {
                    (new DataView(d.buffer)).setUint32(e,
                        a.byteLength, !0);
                    e += 4;
                    d.set(a, e);
                    e += a.byteLength
                };
            f(new Uint8Array(a));
            f(b);
            f(new Uint8Array(c));
            goog.asserts.assert(e == d.length, "Inconsistent init data length");
            return d
        };
        goog.exportSymbol("shaka.util.FairPlayUtils.initDataTransform", shaka.util.FairPlayUtils.initDataTransform);
        shaka.util.Iterables = function() {};
        shaka.util.Iterables.map = function(a, b) {
            for (var c = [], d = $jscomp.makeIterator(a), e = d.next(); !e.done; e = d.next()) c.push(b(e.value));
            return c
        };
        shaka.util.Iterables.every = function(a, b) {
            for (var c = $jscomp.makeIterator(a), d = c.next(); !d.done; d = c.next())
                if (!b(d.value)) return !1;
            return !0
        };
        shaka.util.Iterables.some = function(a, b) {
            for (var c = $jscomp.makeIterator(a), d = c.next(); !d.done; d = c.next())
                if (b(d.value)) return !0;
            return !1
        };
        shaka.util.Iterables.filter = function(a, b) {
            for (var c = [], d = $jscomp.makeIterator(a), e = d.next(); !e.done; e = d.next()) e = e.value, b(e) && c.push(e);
            return c
        };
        shaka.util.MapUtils = {};
        shaka.util.MapUtils.asMap = function(a) {
            var b = new Map;
            Object.keys(a).forEach(function(c) {
                b.set(c, a[c])
            });
            return b
        };
        shaka.util.MapUtils.asObject = function(a) {
            var b = {};
            a.forEach(function(a, d) {
                b[d] = a
            });
            return b
        };
        shaka.util.MimeUtils = function() {};
        shaka.util.MimeUtils.getFullType = function(a, b) {
            var c = a;
            b && (c += '; codecs="' + b + '"');
            return c
        };
        shaka.util.MimeUtils.getExtendedType = function(a) {
            var b = [a.mimeType];
            shaka.util.MimeUtils.EXTENDED_MIME_PARAMETERS_.forEach(function(c, d) {
                var e = a[d];
                e && b.push(c + '="' + e + '"')
            });
            return b.join(";")
        };
        shaka.util.MimeUtils.splitCodecs = function(a) {
            return a.split(",")
        };
        shaka.util.MimeUtils.getCodecBase = function(a) {
            return shaka.util.MimeUtils.getCodecParts_(a)[0]
        };
        shaka.util.MimeUtils.getCodecParts_ = function(a) {
            var b = a.split(".");
            a = b[0];
            b.pop();
            b = b.join(".");
            return [a, b]
        };
        shaka.util.MimeUtils.EXTENDED_MIME_PARAMETERS_ = (new Map).set("codecs", "codecs").set("frameRate", "framerate").set("bandwidth", "bitrate").set("width", "width").set("height", "height").set("channelsCount", "channels");
        shaka.util.MimeUtils.CLOSED_CAPTION_MIMETYPE = "application/cea-608";
        shaka.util.Platform = function() {};
        shaka.util.Platform.supportsMediaSource = function() {
            return window.MediaSource && MediaSource.isTypeSupported ? !0 : !1
        };
        shaka.util.Platform.supportsMediaType = function(a) {
            return "" != shaka.util.Platform.anyMediaElement().canPlayType(a)
        };
        shaka.util.Platform.isEdge = function() {
            return navigator.userAgent.match(/Edge?\//) ? !0 : !1
        };
        shaka.util.Platform.isLegacyEdge = function() {
            return navigator.userAgent.match(/Edge\//) ? !0 : !1
        };
        shaka.util.Platform.isIE = function() {
            return shaka.util.Platform.userAgentContains_("Trident/")
        };
        shaka.util.Platform.isTizen = function() {
            return shaka.util.Platform.userAgentContains_("Tizen")
        };
        shaka.util.Platform.isTizen4 = function() {
            return shaka.util.Platform.userAgentContains_("Tizen 4")
        };
        shaka.util.Platform.isTizen3 = function() {
            return shaka.util.Platform.userAgentContains_("Tizen 3")
        };
        shaka.util.Platform.isTizen2 = function() {
            return shaka.util.Platform.userAgentContains_("Tizen 2")
        };
        shaka.util.Platform.isWebOS = function() {
            return shaka.util.Platform.userAgentContains_("Web0S")
        };
        shaka.util.Platform.isChromecast = function() {
            return shaka.util.Platform.userAgentContains_("CrKey")
        };
        shaka.util.Platform.isChrome = function() {
            return shaka.util.Platform.userAgentContains_("Chrome") && !shaka.util.Platform.isEdge()
        };
        shaka.util.Platform.isApple = function() {
            return !!navigator.vendor && navigator.vendor.includes("Apple") && !shaka.util.Platform.isTizen()
        };
        shaka.util.Platform.safariVersion = function() {
            if (!shaka.util.Platform.isApple()) return null;
            var a = navigator.userAgent.match(/Version\/(\d+)/);
            return a ? parseInt(a[1], 10) : (a = navigator.userAgent.match(/OS (\d+)(?:_\d+)?/)) ? parseInt(a[1], 10) : null
        };
        shaka.util.Platform.isMobile = function() {
            return /(?:iPhone|iPad|iPod|Android)/.test(navigator.userAgent) ? !0 : shaka.util.Platform.isApple() && 1 < navigator.maxTouchPoints
        };
        shaka.util.Platform.userAgentContains_ = function(a) {
            return (navigator.userAgent || "").includes(a)
        };
        shaka.util.Platform.anyMediaElement = function() {
            var a = shaka.util.Platform;
            if (a.cachedMediaElement_) return a.cachedMediaElement_;
            a.cacheExpirationTimer_ || (a.cacheExpirationTimer_ = new shaka.util.Timer(function() {
                a.cachedMediaElement_ = null
            }));
            a.cachedMediaElement_ = document.getElementsByTagName("video")[0] || document.getElementsByTagName("audio")[0];
            a.cachedMediaElement_ || (a.cachedMediaElement_ = document.createElement("video"));
            a.cacheExpirationTimer_.tickAfter(1);
            return a.cachedMediaElement_
        };
        shaka.util.Platform.cacheExpirationTimer_ = null;
        shaka.util.Platform.cachedMediaElement_ = null;
        shaka.media.DrmEngine = function(a, b) {
            var c = this;
            b = void 0 === b ? 1 : b;
            this.playerInterface_ = a;
            this.supportedTypes_ = new Set;
            this.video_ = this.mediaKeys_ = null;
            this.initialized_ = !1;
            this.licenseTimeSeconds_ = 0;
            this.currentDrmInfo_ = null;
            this.eventManager_ = new shaka.util.EventManager;
            this.activeSessions_ = new Map;
            this.offlineSessionIds_ = [];
            this.allSessionsLoaded_ = new shaka.util.PublicPromise;
            this.config_ = null;
            this.onError_ = function(b) {
                c.allSessionsLoaded_.reject(b);
                a.onError(b)
            };
            this.keyStatusByKeyId_ = new Map;
            this.announcedKeyStatusByKeyId_ =
                new Map;
            this.keyStatusTimer_ = new shaka.util.Timer(function() {
                return c.processKeyStatusChanges_()
            });
            this.isDestroying_ = !1;
            this.finishedDestroyingPromise_ = new shaka.util.PublicPromise;
            this.usePersistentLicenses_ = !1;
            this.mediaKeyMessageEvents_ = [];
            this.initialRequestsSent_ = !1;
            this.expirationTimer_ = (new shaka.util.Timer(function() {
                c.pollExpiration_()
            })).tickEvery(b);
            this.allSessionsLoaded_["catch"](function() {})
        };
        shaka.media.DrmEngine.prototype.destroy = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            if (a.isDestroying_) return c.yield(a.finishedDestroyingPromise_, 0);
                            a.isDestroying_ = !0;
                            return c.yield(a.destroyNow_(), 4);
                        case 4:
                            a.finishedDestroyingPromise_.resolve(), c.jumpTo(0)
                    }
                })
            })
        };
        shaka.media.DrmEngine.prototype.destroyNow_ = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return a.eventManager_.release(), a.eventManager_ = null, a.allSessionsLoaded_.reject(), a.expirationTimer_.stop(), a.expirationTimer_ = null, a.keyStatusTimer_.stop(), a.keyStatusTimer_ = null, c.yield(a.closeOpenSessions_(), 2);
                        case 2:
                            if (!a.video_) {
                                c.jumpTo(3);
                                break
                            }
                            goog.asserts.assert(!a.video_.src,
                                "video src must be removed first!");
                            c.setCatchFinallyBlocks(4);
                            return c.yield(a.video_.setMediaKeys(null), 6);
                        case 6:
                            c.leaveTryBlock(5);
                            break;
                        case 4:
                            c.enterCatchBlock();
                        case 5:
                            a.video_ = null;
                        case 3:
                            a.currentDrmInfo_ = null, a.supportedTypes_.clear(), a.mediaKeys_ = null, a.offlineSessionIds_ = [], a.config_ = null, a.onError_ = null, a.playerInterface_ = null, c.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.DrmEngine.prototype.configure = function(a) {
            this.config_ = a
        };
        shaka.media.DrmEngine.prototype.initForStorage = function(a, b) {
            this.offlineSessionIds_ = [];
            this.usePersistentLicenses_ = b;
            return this.init_(a)
        };
        shaka.media.DrmEngine.prototype.initForPlayback = function(a, b) {
            this.offlineSessionIds_ = b;
            this.usePersistentLicenses_ = 0 < b.length;
            return this.init_(a)
        };
        shaka.media.DrmEngine.prototype.initForRemoval = function(a, b, c, d, e) {
            var f = new Map;
            f.set(a, {
                audioCapabilities: d,
                videoCapabilities: e,
                distinctiveIdentifier: "optional",
                persistentState: "required",
                sessionTypes: ["persistent-license"],
                label: a,
                drmInfos: [{
                    keySystem: a,
                    licenseServerUri: b,
                    distinctiveIdentifierRequired: !1,
                    persistentStateRequired: !0,
                    audioRobustness: "",
                    videoRobustness: "",
                    serverCertificate: c,
                    initData: null,
                    keyIds: null
                }]
            });
            return this.queryMediaKeys_(f)
        };
        shaka.media.DrmEngine.prototype.init_ = function(a) {
            goog.asserts.assert(this.config_, "DrmEngine configure() must be called before init()!");
            var b = this.configureClearKey_();
            if (b)
                for (var c = $jscomp.makeIterator(a), d = c.next(); !d.done; d = c.next()) d.value.drmInfos = [b];
            b = a.some(function(a) {
                return 0 < a.drmInfos.length
            });
            b || (d = shaka.util.MapUtils.asMap(this.config_.servers), shaka.media.DrmEngine.replaceDrmInfo_(a, d));
            c = $jscomp.makeIterator(a);
            for (d = c.next(); !d.done; d = c.next()) {
                d = $jscomp.makeIterator(d.value.drmInfos);
                for (var e = d.next(); !e.done; e = d.next()) shaka.media.DrmEngine.fillInDrmInfoDefaults_(e.value, shaka.util.MapUtils.asMap(this.config_.servers), shaka.util.MapUtils.asMap(this.config_.advanced || {}))
            }
            a = this.prepareMediaKeyConfigsForVariants_(a);
            if (!a.size) return this.initialized_ = !0, Promise.resolve();
            a = this.queryMediaKeys_(a);
            return b ? a : a["catch"](function() {})
        };
        shaka.media.DrmEngine.prototype.attach = function(a) {
            var b = this;
            if (!this.mediaKeys_) return this.eventManager_.listenOnce(a, "encrypted", function(a) {
                b.onError_(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.ENCRYPTED_CONTENT_WITHOUT_DRM_INFO))
            }), Promise.resolve();
            this.video_ = a;
            this.eventManager_.listenOnce(this.video_, "play", function() {
                return b.onPlay_()
            });
            "webkitCurrentPlaybackTargetIsWireless" in this.video_ && this.eventManager_.listen(this.video_,
                "webkitcurrentplaybacktargetiswirelesschanged",
                function() {
                    return b.closeOpenSessions_()
                });
            a = this.video_.setMediaKeys(this.mediaKeys_);
            a = a["catch"](function(a) {
                return Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.FAILED_TO_ATTACH_TO_VIDEO, a.message))
            });
            var c = this.setServerCertificate();
            return Promise.all([a, c]).then(function() {
                if (b.isDestroying_) return Promise.reject();
                b.createOrLoad();
                b.currentDrmInfo_.initData.length || b.offlineSessionIds_.length ||
                    b.eventManager_.listen(b.video_, "encrypted", function(a) {
                        return b.newInitData(a.initDataType, new Uint8Array(a.initData))
                    })
            })["catch"](function(a) {
                if (!b.isDestroying_) return Promise.reject(a)
            })
        };
        shaka.media.DrmEngine.prototype.setServerCertificate = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            goog.asserts.assert(a.initialized_, "Must call init() before setServerCertificate");
                            if (!(a.mediaKeys_ && a.currentDrmInfo_ && a.currentDrmInfo_.serverCertificate && a.currentDrmInfo_.serverCertificate.length)) {
                                c.jumpTo(0);
                                break
                            }
                            c.setCatchFinallyBlocks(3);
                            return c.yield(a.mediaKeys_.setServerCertificate(a.currentDrmInfo_.serverCertificate),
                                5);
                        case 5:
                            (d = c.yieldResult) || shaka.log.warning("Server certificates are not supported by the key system.  The server certificate has been ignored.");
                            c.leaveTryBlock(0);
                            break;
                        case 3:
                            return e = c.enterCatchBlock(), c["return"](Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.INVALID_SERVER_CERTIFICATE, e.message)))
                    }
                })
            })
        };
        shaka.media.DrmEngine.prototype.removeSession = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return goog.asserts.assert(b.mediaKeys_, "Must call init() before removeSession"), d.yield(b.loadOfflineSession_(a), 2);
                        case 2:
                            e = d.yieldResult;
                            if (!e) return shaka.log.v2("Ignoring attempt to remove missing session", a), d["return"]();
                            f = [];
                            if (g = b.activeSessions_.get(e)) g.updatePromise =
                                new shaka.util.PublicPromise, f.push(g.updatePromise);
                            shaka.log.v2("Attempting to remove session", a);
                            f.push(e.remove());
                            return d.yield(Promise.all(f), 0)
                    }
                })
            })
        };
        shaka.media.DrmEngine.prototype.createOrLoad = function() {
            var a = this,
                b = this.currentDrmInfo_ ? this.currentDrmInfo_.initData : [];
            b.forEach(function(b) {
                return a.newInitData(b.initDataType, b.initData)
            });
            this.offlineSessionIds_.forEach(function(b) {
                return a.loadOfflineSession_(b)
            });
            b.length || this.offlineSessionIds_.length || this.allSessionsLoaded_.resolve();
            return this.allSessionsLoaded_
        };
        shaka.media.DrmEngine.prototype.newInitData = function(a, b) {
            var c = shaka.util.Uint8ArrayUtils,
                d = this.activeSessions_.values();
            d = $jscomp.makeIterator(d);
            for (var e = d.next(); !e.done; e = d.next())
                if (c.equal(b, e.value.initData) && !shaka.util.Platform.isTizen2()) {
                    shaka.log.debug("Ignoring duplicate init data.");
                    return
                } this.createTemporarySession_(a, b)
        };
        shaka.media.DrmEngine.prototype.initialized = function() {
            return this.initialized_
        };
        shaka.media.DrmEngine.keySystem = function(a) {
            return a ? a.keySystem : ""
        };
        shaka.media.DrmEngine.prototype.willSupport = function(a) {
            if (shaka.util.Platform.isLegacyEdge()) return !0;
            a = a.toLowerCase();
            if (shaka.util.Platform.isTizen() && a.includes('codecs="ac-3"')) {
                var b = a.replace("ac-3", "ec-3");
                return this.supportedTypes_.has(a) || this.supportedTypes_.has(b)
            }
            return this.supportedTypes_.has(a)
        };
        shaka.media.DrmEngine.prototype.getSessionIds = function() {
            var a = this.activeSessions_.keys();
            a = shaka.util.Iterables.map(a, function(a) {
                return a.sessionId
            });
            return Array.from(a)
        };
        shaka.media.DrmEngine.prototype.getExpiration = function() {
            var a = Infinity,
                b = this.activeSessions_.keys();
            b = $jscomp.makeIterator(b);
            for (var c = b.next(); !c.done; c = b.next()) c = c.value, isNaN(c.expiration) || (a = Math.min(a, c.expiration));
            return a
        };
        shaka.media.DrmEngine.prototype.getLicenseTime = function() {
            return this.licenseTimeSeconds_ ? this.licenseTimeSeconds_ : NaN
        };
        shaka.media.DrmEngine.prototype.getDrmInfo = function() {
            return this.currentDrmInfo_
        };
        shaka.media.DrmEngine.prototype.getKeyStatuses = function() {
            return shaka.util.MapUtils.asObject(this.announcedKeyStatusByKeyId_)
        };
        shaka.media.DrmEngine.prototype.prepareMediaKeyConfigsForVariants_ = function(a) {
            for (var b = new Set, c = $jscomp.makeIterator(a), d = c.next(); !d.done; d = c.next()) {
                var e = $jscomp.makeIterator(d.value.drmInfos);
                for (d = e.next(); !d.done; d = e.next()) b.add(d.value)
            }
            c = $jscomp.makeIterator(b);
            for (d = c.next(); !d.done; d = c.next()) shaka.media.DrmEngine.fillInDrmInfoDefaults_(d.value, shaka.util.MapUtils.asMap(this.config_.servers), shaka.util.MapUtils.asMap(this.config_.advanced || {}));
            e = this.usePersistentLicenses_ ? "required" :
                "optional";
            var f = this.usePersistentLicenses_ ? ["persistent-license"] : ["temporary"];
            c = new Map;
            b = $jscomp.makeIterator(b);
            for (d = b.next(); !d.done; d = b.next()) d = d.value, c.set(d.keySystem, {
                audioCapabilities: [],
                videoCapabilities: [],
                distinctiveIdentifier: "optional",
                persistentState: e,
                sessionTypes: f,
                label: d.keySystem,
                drmInfos: []
            });
            a = $jscomp.makeIterator(a);
            for (d = a.next(); !d.done; d = a.next()) {
                d = d.value;
                b = d.audio;
                e = d.video;
                f = b ? shaka.media.DrmEngine.computeMimeType_(b) : "";
                var g = e ? shaka.media.DrmEngine.computeMimeType_(e) :
                    "",
                    h = $jscomp.makeIterator(d.drmInfos);
                for (d = h.next(); !d.done; d = h.next()) {
                    d = d.value;
                    var k = c.get(d.keySystem);
                    goog.asserts.assert(k, "Any missing configs should have be filled in before.");
                    k.drmInfos.push(d);
                    d.distinctiveIdentifierRequired && (k.distinctiveIdentifier = "required");
                    d.persistentStateRequired && (k.persistentState = "required");
                    if (b && (k.audioCapabilities.push({
                            robustness: d.audioRobustness || "",
                            contentType: f
                        }), "ac-3" == b.codecs.toLowerCase() && shaka.util.Platform.isTizen())) {
                        var l = shaka.util.MimeUtils.getFullType(b.mimeType,
                            "ec-3");
                        k.audioCapabilities.push({
                            robustness: d.audioRobustness || "",
                            contentType: l
                        })
                    }
                    e && k.videoCapabilities.push({
                        robustness: d.videoRobustness || "",
                        contentType: g
                    })
                }
            }
            return c
        };
        shaka.media.DrmEngine.computeMimeType_ = function(a, b) {
            var c = shaka.util.MimeUtils.getFullType(a.mimeType, b || a.codecs);
            return shaka.media.Transmuxer.isSupported(c) ? shaka.media.Transmuxer.convertTsCodecs(a.type, c) : c
        };
        shaka.media.DrmEngine.prototype.queryMediaKeys_ = function(a) {
            if (1 == a.size && a.has("")) return Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.NO_RECOGNIZED_KEY_SYSTEMS));
            for (var b = $jscomp.makeIterator(a.values()), c = b.next(); !c.done; c = b.next()) c = c.value, 0 == c.audioCapabilities.length && delete c.audioCapabilities, 0 == c.videoCapabilities.length && delete c.videoCapabilities;
            var d = b = new shaka.util.PublicPromise;
            [!0, !1].forEach(function(b) {
                var c =
                    this;
                a.forEach(function(a, e) {
                    a.drmInfos.some(function(a) {
                        return !!a.licenseServerUri
                    }) == b && (d = d["catch"](function() {
                        if (!this.isDestroying_) return navigator.requestMediaKeySystemAccess(e, [a])
                    }.bind(c)))
                })
            }.bind(this));
            d = d["catch"](function() {
                return Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE))
            });
            d = d.then(function(b) {
                if (this.isDestroying_) return Promise.reject();
                this.supportedTypes_.clear();
                var c = b.getConfiguration(),
                    d = c.videoCapabilities || [],
                    e = $jscomp.makeIterator(c.audioCapabilities || []);
                for (c = e.next(); !c.done; c = e.next()) this.supportedTypes_.add(c.value.contentType.toLowerCase());
                d = $jscomp.makeIterator(d);
                for (c = d.next(); !c.done; c = d.next()) this.supportedTypes_.add(c.value.contentType.toLowerCase());
                goog.asserts.assert(this.supportedTypes_.size, "We should get at least one supported MIME type");
                this.currentDrmInfo_ = shaka.media.DrmEngine.createDrmInfoFor_(b.keySystem, a.get(b.keySystem));
                return this.currentDrmInfo_.licenseServerUri ? b.createMediaKeys() : Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.NO_LICENSE_SERVER_GIVEN, this.currentDrmInfo_.keySystem))
            }.bind(this)).then(function(a) {
                if (this.isDestroying_) return Promise.reject();
                shaka.log.info("Created MediaKeys object for key system", this.currentDrmInfo_.keySystem);
                this.mediaKeys_ = a;
                this.initialized_ = !0
            }.bind(this))["catch"](function(a) {
                if (!this.isDestroying_) return this.currentDrmInfo_ =
                    null, this.supportedTypes_.clear(), a instanceof shaka.util.Error ? Promise.reject(a) : Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.FAILED_TO_CREATE_CDM, a.message))
            }.bind(this));
            b.reject();
            return d
        };
        shaka.media.DrmEngine.prototype.configureClearKey_ = function() {
            var a = shaka.util.MapUtils.asMap(this.config_.clearKeys);
            if (0 == a.size) return null;
            var b = shaka.util.StringUtils,
                c = shaka.util.Uint8ArrayUtils,
                d = [],
                e = [];
            a.forEach(function(a, b) {
                var f = c.fromHex(b),
                    g = c.fromHex(a);
                f = {
                    kty: "oct",
                    kid: c.toBase64(f, !1),
                    k: c.toBase64(g, !1)
                };
                d.push(f);
                e.push(f.kid)
            });
            a = JSON.stringify({
                keys: d
            });
            var f = JSON.stringify({
                kids: e
            });
            b = [{
                initData: new Uint8Array(b.toUTF8(f)),
                initDataType: "keyids"
            }];
            return {
                keySystem: "org.w3.clearkey",
                licenseServerUri: "data:application/json;base64," + window.btoa(a),
                distinctiveIdentifierRequired: !1,
                persistentStateRequired: !1,
                audioRobustness: "",
                videoRobustness: "",
                serverCertificate: null,
                initData: b,
                keyIds: []
            }
        };
        shaka.media.DrmEngine.prototype.loadOfflineSession_ = function(a) {
            try {
                shaka.log.v1("Attempting to load an offline session", a);
                var b = this.mediaKeys_.createSession("persistent-license")
            } catch (e) {
                var c = new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.FAILED_TO_CREATE_SESSION, e.message);
                this.onError_(c);
                return Promise.reject(c)
            }
            this.eventManager_.listen(b, "message", this.onSessionMessage_.bind(this));
            this.eventManager_.listen(b, "keystatuseschange",
                this.onKeyStatusesChange_.bind(this));
            var d = {
                initData: null,
                loaded: !1,
                oldExpiration: Infinity,
                updatePromise: null
            };
            this.activeSessions_.set(b, d);
            return b.load(a).then(function(c) {
                    if (this.isDestroying_) return Promise.reject();
                    shaka.log.v2("Loaded offline session", a, c);
                    if (c) return d.loaded = !0, this.areAllSessionsLoaded_() && this.allSessionsLoaded_.resolve(), b;
                    this.activeSessions_["delete"](b);
                    this.onError_(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.OFFLINE_SESSION_REMOVED))
                }.bind(this),
                function(a) {
                    this.isDestroying_ || (this.activeSessions_["delete"](b), this.onError_(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.FAILED_TO_CREATE_SESSION, a.message)))
                }.bind(this))
        };
        shaka.media.DrmEngine.prototype.createTemporarySession_ = function(a, b) {
            var c = this;
            try {
                if (this.usePersistentLicenses_) {
                    shaka.log.v1("Creating new persistent session");
                    var d = this.mediaKeys_.createSession("persistent-license")
                } else shaka.log.v1("Creating new temporary session"), d = this.mediaKeys_.createSession()
            } catch (f) {
                this.onError_(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.FAILED_TO_CREATE_SESSION, f.message));
                return
            }
            this.eventManager_.listen(d,
                "message", this.onSessionMessage_.bind(this));
            this.eventManager_.listen(d, "keystatuseschange", this.onKeyStatusesChange_.bind(this));
            this.activeSessions_.set(d, {
                initData: b,
                loaded: !1,
                oldExpiration: Infinity,
                updatePromise: null
            });
            try {
                b = this.config_.initDataTransform(b, this.currentDrmInfo_)
            } catch (f) {
                var e = f;
                f instanceof shaka.util.Error || (e = new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.INIT_DATA_TRANSFORM_ERROR, f));
                this.onError_(e);
                return
            }
            d.generateRequest(a,
                b)["catch"](function(a) {
                if (!c.isDestroying_) {
                    c.activeSessions_["delete"](d);
                    if (a.errorCode && a.errorCode.systemCode) {
                        var b = a.errorCode.systemCode;
                        0 > b && (b += Math.pow(2, 32));
                        b = "0x" + b.toString(16)
                    }
                    c.onError_(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.FAILED_TO_GENERATE_LICENSE_REQUEST, a.message, a, b))
                }
            })
        };
        shaka.media.DrmEngine.defaultInitDataTransform = function(a, b) {
            if (shaka.media.DrmEngine.keySystem(b).startsWith("com.apple.fps")) {
                var c = b.serverCertificate,
                    d = shaka.util.FairPlayUtils.defaultGetContentId(a);
                a = shaka.util.FairPlayUtils.initDataTransform(a, d, c)
            }
            return a
        };
        shaka.media.DrmEngine.prototype.onSessionMessage_ = function(a) {
            this.delayLicenseRequest_() ? this.mediaKeyMessageEvents_.push(a) : this.sendLicenseRequest_(a)
        };
        shaka.media.DrmEngine.prototype.delayLicenseRequest_ = function() {
            return this.video_ ? this.config_.delayLicenseRequestUntilPlayed && this.video_.paused && !this.initialRequestsSent_ : !1
        };
        shaka.media.DrmEngine.prototype.sendLicenseRequest_ = function(a) {
            var b = a.target;
            shaka.log.v1("Sending license request for session", b.sessionId, "of type", a.messageType);
            var c = this.activeSessions_.get(b),
                d = this.currentDrmInfo_.licenseServerUri,
                e = this.config_.advanced[this.currentDrmInfo_.keySystem];
            "individualization-request" == a.messageType && e && e.individualizationServer && (d = e.individualizationServer);
            e = shaka.net.NetworkingEngine.RequestType.LICENSE;
            d = shaka.net.NetworkingEngine.makeRequest([d], this.config_.retryParameters);
            d.body = a.message;
            d.method = "POST";
            d.licenseRequestType = a.messageType;
            d.sessionId = b.sessionId;
            "com.microsoft.playready" != this.currentDrmInfo_.keySystem && "com.chromecast.playready" != this.currentDrmInfo_.keySystem || this.unpackPlayReadyRequest_(d);
            this.currentDrmInfo_.keySystem.startsWith("com.apple.fps") && this.config_.fairPlayTransform && this.formatFairPlayRequest_(d);
            var f = Date.now();
            this.playerInterface_.netEngine.request(e, d).promise.then(function(a) {
                    if (this.isDestroying_) return Promise.reject();
                    this.currentDrmInfo_.keySystem.startsWith("com.apple.fps") &&
                        this.config_.fairPlayTransform && this.parseFairPlayResponse_(a);
                    this.licenseTimeSeconds_ += (Date.now() - f) / 1E3;
                    shaka.log.v1("Updating session", b.sessionId);
                    return b.update(a.data).then(function() {
                        var a = this,
                            b = new shaka.util.FakeEvent("drmsessionupdate");
                        this.playerInterface_.onEvent(b);
                        c && (c.updatePromise && c.updatePromise.resolve(), (new shaka.util.Timer(function() {
                            c.loaded = !0;
                            a.areAllSessionsLoaded_() && a.allSessionsLoaded_.resolve()
                        })).tickAfter(shaka.media.DrmEngine.SESSION_LOAD_TIMEOUT_))
                    }.bind(this))
                }.bind(this),
                function(a) {
                    this.isDestroying_ || (goog.asserts.assert(a instanceof shaka.util.Error, "Wrong NetworkingEngine error type!"), a = new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.LICENSE_REQUEST_FAILED, a), this.onError_(a), c && c.updatePromise && c.updatePromise.reject(a))
                }.bind(this))["catch"](function(a) {
                this.isDestroying_ || (a = new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.LICENSE_RESPONSE_REJECTED,
                    a.message), this.onError_(a), c && c.updatePromise && c.updatePromise.reject(a))
            }.bind(this))
        };
        shaka.media.DrmEngine.prototype.unpackPlayReadyRequest_ = function(a) {
            var b = shaka.util.StringUtils.fromUTF16(a.body, !0, !0);
            if (b.includes("PlayReadyKeyMessage")) {
                shaka.log.debug("Unwrapping PlayReady request.");
                b = (new DOMParser).parseFromString(b, "application/xml");
                for (var c = b.getElementsByTagName("HttpHeader"), d = 0; d < c.length; ++d) {
                    var e = c[d].getElementsByTagName("name")[0],
                        f = c[d].getElementsByTagName("value")[0];
                    goog.asserts.assert(e && f, "Malformed PlayReady headers!");
                    a.headers[e.textContent] = f.textContent
                }
                b =
                    b.getElementsByTagName("Challenge")[0];
                goog.asserts.assert(b, "Malformed PlayReady challenge!");
                goog.asserts.assert("base64encoded" == b.getAttribute("encoding"), "Unexpected PlayReady challenge encoding!");
                a.body = shaka.util.Uint8ArrayUtils.fromBase64(b.textContent).buffer
            } else shaka.log.debug("PlayReady request is already unwrapped."), a.headers["Content-Type"] = "text/xml; charset=utf-8"
        };
        shaka.media.DrmEngine.prototype.formatFairPlayRequest_ = function(a) {
            var b = new Uint8Array(a.body);
            b = shaka.util.Uint8ArrayUtils.toBase64(b);
            a.headers["Content-Type"] = "application/x-www-form-urlencoded";
            a.body = shaka.util.StringUtils.toUTF8("spc=" + b)
        };
        shaka.media.DrmEngine.prototype.parseFairPlayResponse_ = function(a) {
            try {
                var b = shaka.util.StringUtils.fromUTF8(a.data)
            } catch (c) {
                return
            }
            b = b.trim();
            "<ckc>" === b.substr(0, 5) && "</ckc>" === b.substr(-6) && (b = b.slice(5, -6));
            try {
                b = JSON.parse(b).ckc
            } catch (c) {}
            a.data = shaka.util.Uint8ArrayUtils.fromBase64(b).buffer
        };
        shaka.media.DrmEngine.prototype.onKeyStatusesChange_ = function(a) {
            a = a.target;
            shaka.log.v2("Key status changed for session", a.sessionId);
            var b = this.activeSessions_.get(a),
                c = !1;
            a.keyStatuses.forEach(function(a, d) {
                if ("string" == typeof d) {
                    var e = d;
                    d = a;
                    a = e
                }
                if ("com.microsoft.playready" == this.currentDrmInfo_.keySystem && 16 == d.byteLength && (shaka.util.Platform.isIE() || shaka.util.Platform.isEdge())) {
                    e = new DataView(d);
                    var f = e.getUint32(0, !0),
                        k = e.getUint16(4, !0),
                        l = e.getUint16(6, !0);
                    e.setUint32(0, f, !1);
                    e.setUint16(4,
                        k, !1);
                    e.setUint16(6, l, !1)
                }
                "com.microsoft.playready" == this.currentDrmInfo_.keySystem && "status-pending" == a && (a = "usable");
                "status-pending" != a && (b.loaded = !0);
                b || goog.asserts.assert("usable" != a, "Usable keys found in closed session");
                "expired" == a && (c = !0);
                e = shaka.util.Uint8ArrayUtils.toHex(new Uint8Array(d));
                this.keyStatusByKeyId_.set(e, a)
            }.bind(this));
            var d = a.expiration - Date.now();
            (0 > d || c && 1E3 > d) && b && !b.updatePromise && (shaka.log.debug("Session has expired", a.sessionId), this.activeSessions_["delete"](a),
                a.close()["catch"](function() {}));
            this.areAllSessionsLoaded_() && (this.allSessionsLoaded_.resolve(), this.keyStatusTimer_.tickAfter(shaka.media.DrmEngine.KEY_STATUS_BATCH_TIME_))
        };
        shaka.media.DrmEngine.prototype.processKeyStatusChanges_ = function() {
            var a = this.keyStatusByKeyId_,
                b = this.announcedKeyStatusByKeyId_;
            b.clear();
            a.forEach(function(a, d) {
                return b.set(d, a)
            });
            a = Array.from(b.values());
            if (a.length && a.every(function(a) {
                    return "expired" == a
                })) this.onError_(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.DRM, shaka.util.Error.Code.EXPIRED));
            this.playerInterface_.onKeyStatus(shaka.util.MapUtils.asObject(b))
        };
        shaka.media.DrmEngine.isBrowserSupported = function() {
            return !!window.MediaKeys && !!window.navigator && !!window.navigator.requestMediaKeySystemAccess && !!window.MediaKeySystemAccess && !!window.MediaKeySystemAccess.prototype.getConfiguration
        };
        shaka.media.DrmEngine.probeSupport = function() {
            goog.asserts.assert(shaka.media.DrmEngine.isBrowserSupported(), "Must have basic EME support");
            var a = [{
                    contentType: 'video/mp4; codecs="avc1.42E01E"'
                }, {
                    contentType: 'video/webm; codecs="vp8"'
                }],
                b = [{
                    videoCapabilities: a,
                    persistentState: "required",
                    sessionTypes: ["persistent-license"]
                }, {
                    videoCapabilities: a
                }],
                c = new Map,
                d = function(a) {
                    return $jscomp.asyncExecutePromiseGeneratorFunction(function g() {
                        var d, e, l;
                        return $jscomp.generator.createGenerator(g, function(g) {
                            switch (g.nextAddress) {
                                case 1:
                                    return g.setCatchFinallyBlocks(2),
                                        g.yield(navigator.requestMediaKeySystemAccess(a, b), 4);
                                case 4:
                                    return d = g.yieldResult, l = (e = d.getConfiguration().sessionTypes) ? e.includes("persistent-license") : !1, shaka.util.Platform.isTizen3() && (l = !1), c.set(a, {
                                        persistentState: l
                                    }), g.yield(d.createMediaKeys(), 5);
                                case 5:
                                    g.leaveTryBlock(0);
                                    break;
                                case 2:
                                    g.enterCatchBlock(), c.set(a, null), g.jumpToEnd()
                            }
                        })
                    })
                };
            a = "org.w3.clearkey com.widevine.alpha com.microsoft.playready com.apple.fps.3_0 com.apple.fps.2_0 com.apple.fps.1_0 com.apple.fps com.adobe.primetime".split(" ").map(function(a) {
                return d(a)
            });
            return Promise.all(a).then(function() {
                return shaka.util.MapUtils.asObject(c)
            })
        };
        shaka.media.DrmEngine.prototype.onPlay_ = function() {
            for (var a = 0; a < this.mediaKeyMessageEvents_.length; a++) this.sendLicenseRequest_(this.mediaKeyMessageEvents_[a]);
            this.initialRequestsSent_ = !0;
            this.mediaKeyMessageEvents_ = []
        };
        shaka.media.DrmEngine.prototype.supportsVariant = function(a) {
            var b = a.audio,
                c = a.video;
            if (b && b.encrypted && (b = shaka.media.DrmEngine.computeMimeType_(b), !this.willSupport(b)) || c && c.encrypted && (c = shaka.media.DrmEngine.computeMimeType_(c), !this.willSupport(c))) return !1;
            var d = shaka.media.DrmEngine.keySystem(this.currentDrmInfo_);
            return 0 == a.drmInfos.length || a.drmInfos.some(function(a) {
                return a.keySystem == d
            })
        };
        shaka.media.DrmEngine.areDrmCompatible = function(a, b) {
            return a.length && b.length ? 0 < shaka.media.DrmEngine.getCommonDrmInfos(a, b).length : !0
        };
        shaka.media.DrmEngine.getCommonDrmInfos = function(a, b) {
            if (!a.length) return b;
            if (!b.length) return a;
            for (var c = [], d = 0; d < a.length; d++)
                for (var e = 0; e < b.length; e++)
                    if (a[d].keySystem == b[e].keySystem) {
                        var f = a[d];
                        e = b[e];
                        var g = [];
                        g = g.concat(f.initData || []);
                        g = g.concat(e.initData || []);
                        var h = [];
                        h = h.concat(f.keyIds);
                        h = h.concat(e.keyIds);
                        c.push({
                            keySystem: f.keySystem,
                            licenseServerUri: f.licenseServerUri || e.licenseServerUri,
                            distinctiveIdentifierRequired: f.distinctiveIdentifierRequired || e.distinctiveIdentifierRequired,
                            persistentStateRequired: f.persistentStateRequired || e.persistentStateRequired,
                            videoRobustness: f.videoRobustness || e.videoRobustness,
                            audioRobustness: f.audioRobustness || e.audioRobustness,
                            serverCertificate: f.serverCertificate || e.serverCertificate,
                            initData: g,
                            keyIds: h
                        });
                        break
                    } return c
        };
        shaka.media.DrmEngine.prototype.closeSession_ = function(a) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return d = shaka.media.DrmEngine, e = new Promise(function(a, c) {
                                (new shaka.util.Timer(c)).tickAfter(d.CLOSE_TIMEOUT_)
                            }), c.setCatchFinallyBlocks(2), c.yield(Promise.race([Promise.all([a.close(), a.closed]), e]), 4);
                        case 4:
                            c.leaveTryBlock(0);
                            break;
                        case 2:
                            c.enterCatchBlock(), shaka.log.warning("Timeout waiting for session close"),
                                c.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.DrmEngine.prototype.closeOpenSessions_ = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return d = Array.from(a.activeSessions_.keys()), a.activeSessions_.clear(), c.yield(Promise.all(d.map(function(c) {
                                return $jscomp.asyncExecutePromiseGeneratorFunction(function h() {
                                    return $jscomp.generator.createGenerator(h, function(d) {
                                        switch (d.nextAddress) {
                                            case 1:
                                                return shaka.log.v1("Closing session", c.sessionId),
                                                    d.setCatchFinallyBlocks(2), d.yield(a.closeSession_(c), 4);
                                            case 4:
                                                d.leaveTryBlock(0);
                                                break;
                                            case 2:
                                                d.enterCatchBlock(), d.jumpToEnd()
                                        }
                                    })
                                })
                            })), 0)
                    }
                })
            })
        };
        shaka.media.DrmEngine.prototype.pollExpiration_ = function() {
            var a = this;
            this.activeSessions_.forEach(function(b, c) {
                var d = b.oldExpiration,
                    e = c.expiration;
                isNaN(e) && (e = Infinity);
                e != d && (a.playerInterface_.onExpirationUpdated(c.sessionId, e), b.oldExpiration = e)
            })
        };
        shaka.media.DrmEngine.prototype.areAllSessionsLoaded_ = function() {
            var a = this.activeSessions_.values();
            return shaka.util.Iterables.every(a, function(a) {
                return a.loaded
            })
        };
        shaka.media.DrmEngine.replaceDrmInfo_ = function(a, b) {
            var c = [];
            b.forEach(function(a, b) {
                c.push({
                    keySystem: b,
                    licenseServerUri: a,
                    distinctiveIdentifierRequired: !1,
                    persistentStateRequired: !1,
                    audioRobustness: "",
                    videoRobustness: "",
                    serverCertificate: null,
                    initData: [],
                    keyIds: []
                })
            });
            for (var d = $jscomp.makeIterator(a), e = d.next(); !e.done; e = d.next()) e.value.drmInfos = c
        };
        shaka.media.DrmEngine.createDrmInfoFor_ = function(a, b) {
            var c = [],
                d = [],
                e = [],
                f = [];
            shaka.media.DrmEngine.processDrmInfos_(b.drmInfos, c, d, e, f);
            1 < d.length && shaka.log.warning("Multiple unique server certificates found! Only the first will be used.");
            1 < c.length && shaka.log.warning("Multiple unique license server URIs found! Only the first will be used.");
            return {
                keySystem: a,
                licenseServerUri: c[0],
                distinctiveIdentifierRequired: "required" == b.distinctiveIdentifier,
                persistentStateRequired: "required" == b.persistentState,
                audioRobustness: (b.audioCapabilities ? b.audioCapabilities[0].robustness : "") || "",
                videoRobustness: (b.videoCapabilities ? b.videoCapabilities[0].robustness : "") || "",
                serverCertificate: d[0],
                initData: e,
                keyIds: f
            }
        };
        shaka.media.DrmEngine.processDrmInfos_ = function(a, b, c, d, e) {
            a.forEach(function(a) {
                var f = shaka.util.Uint8ArrayUtils;
                b.includes(a.licenseServerUri) || b.push(a.licenseServerUri);
                a.serverCertificate && (c.some(function(b) {
                    return f.equal(b, a.serverCertificate)
                }) || c.push(a.serverCertificate));
                a.initData && a.initData.forEach(function(a) {
                    d.some(function(b) {
                        b = b.keyId && b.keyId == a.keyId ? !0 : b.initDataType == a.initDataType && shaka.util.Uint8ArrayUtils.equal(b.initData, a.initData);
                        return b
                    }) || d.push(a)
                });
                if (a.keyIds)
                    for (var h =
                            0; h < a.keyIds.length; ++h) e.includes(a.keyIds[h]) || e.push(a.keyIds[h])
            })
        };
        shaka.media.DrmEngine.fillInDrmInfoDefaults_ = function(a, b, c) {
            if (a.keySystem && ("org.w3.clearkey" != a.keySystem || !a.licenseServerUri)) {
                b.size && (b = b.get(a.keySystem) || "", a.licenseServerUri = b);
                a.keyIds || (a.keyIds = []);
                if (c = c.get(a.keySystem)) a.distinctiveIdentifierRequired || (a.distinctiveIdentifierRequired = c.distinctiveIdentifierRequired), a.persistentStateRequired || (a.persistentStateRequired = c.persistentStateRequired), a.videoRobustness || (a.videoRobustness = c.videoRobustness), a.audioRobustness || (a.audioRobustness =
                    c.audioRobustness), a.serverCertificate || (a.serverCertificate = c.serverCertificate);
                window.cast && window.cast.__platform__ && "com.microsoft.playready" == a.keySystem && (a.keySystem = "com.chromecast.playready")
            }
        };
        shaka.media.DrmEngine.CLOSE_TIMEOUT_ = 1;
        shaka.media.DrmEngine.SESSION_LOAD_TIMEOUT_ = 5;
        shaka.media.DrmEngine.KEY_STATUS_BATCH_TIME_ = .5;
        shaka.media.IClosedCaptionParser = function() {};
        shaka.media.IClosedCaptionParser.prototype.init = function(a) {};
        shaka.media.IClosedCaptionParser.prototype.parseFrom = function(a, b) {};
        shaka.media.IClosedCaptionParser.prototype.reset = function() {};
        shaka.media.MuxJSClosedCaptionParser = function() {
            this.muxCaptionParser_ = new muxjs.mp4.CaptionParser;
            this.videoTrackIds_ = [];
            this.timescales_ = {}
        };
        shaka.media.MuxJSClosedCaptionParser.prototype.init = function(a) {
            var b = muxjs.mp4.probe;
            a = new Uint8Array(a);
            this.videoTrackIds_ = b.videoTrackIds(a);
            this.timescales_ = b.timescale(a);
            this.muxCaptionParser_.init()
        };
        shaka.media.MuxJSClosedCaptionParser.prototype.parseFrom = function(a, b) {
            var c = new Uint8Array(a);
            (c = this.muxCaptionParser_.parse(c, this.videoTrackIds_, this.timescales_)) && c.captions && b(c.captions);
            this.muxCaptionParser_.clearParsedCaptions()
        };
        shaka.media.MuxJSClosedCaptionParser.prototype.reset = function() {
            this.muxCaptionParser_.resetCaptionStream()
        };
        shaka.media.MuxJSClosedCaptionParser.isSupported = function() {
            return !!window.muxjs
        };
        shaka.media.NoopCaptionParser = function() {};
        shaka.media.NoopCaptionParser.prototype.init = function(a) {};
        shaka.media.NoopCaptionParser.prototype.parseFrom = function(a, b) {};
        shaka.media.NoopCaptionParser.prototype.reset = function() {};
        shaka.media.TimeRangesUtils = {};
        shaka.media.TimeRangesUtils.bufferStart = function(a) {
            return !a || 1 == a.length && 1E-6 > a.end(0) - a.start(0) ? null : 1 == a.length && 0 > a.start(0) ? 0 : a.length ? a.start(0) : null
        };
        shaka.media.TimeRangesUtils.bufferEnd = function(a) {
            return !a || 1 == a.length && 1E-6 > a.end(0) - a.start(0) ? null : a.length ? a.end(a.length - 1) : null
        };
        shaka.media.TimeRangesUtils.isBuffered = function(a, b, c) {
            c = void 0 === c ? 0 : c;
            return !a || !a.length || 1 == a.length && 1E-6 > a.end(0) - a.start(0) || b > a.end(a.length - 1) ? !1 : b + c >= a.start(0)
        };
        shaka.media.TimeRangesUtils.bufferedAheadOf = function(a, b) {
            if (!a || !a.length || 1 == a.length && 1E-6 > a.end(0) - a.start(0)) return 0;
            for (var c = 0, d = a.length - 1; 0 <= d && a.end(d) > b; --d) c += a.end(d) - Math.max(a.start(d), b);
            return c
        };
        shaka.media.TimeRangesUtils.getGapIndex = function(a, b) {
            var c = shaka.util.Platform;
            if (!a || !a.length || 1 == a.length && 1E-6 > a.end(0) - a.start(0)) return null;
            c = c.isLegacyEdge() || c.isIE() || c.isTizen() || c.isChromecast() ? .5 : .1;
            for (var d = 0; d < a.length; d++)
                if (a.start(d) > b && (0 == d || a.end(d - 1) - b <= c)) return d;
            return null
        };
        shaka.media.TimeRangesUtils.getBufferedInfo = function(a) {
            if (!a) return [];
            for (var b = [], c = 0; c < a.length; c++) b.push({
                start: a.start(c),
                end: a.end(c)
            });
            return b
        };
        shaka.text = {};
        shaka.text.Cue = function(a, b, c) {
            var d = shaka.text.Cue;
            this.startTime = a;
            this.direction = d.direction.HORIZONTAL_LEFT_TO_RIGHT;
            this.endTime = b;
            this.payload = c;
            this.region = new shaka.text.CueRegion;
            this.position = null;
            this.positionAlign = d.positionAlign.AUTO;
            this.size = 0;
            this.textAlign = d.textAlign.CENTER;
            this.writingMode = d.writingMode.HORIZONTAL_TOP_TO_BOTTOM;
            this.lineInterpretation = d.lineInterpretation.LINE_NUMBER;
            this.line = null;
            this.lineHeight = "";
            this.lineAlign = d.lineAlign.START;
            this.displayAlign = d.displayAlign.AFTER;
            this.fontSize = this.backgroundImage = this.backgroundColor = this.color = "";
            this.fontWeight = d.fontWeight.NORMAL;
            this.fontStyle = d.fontStyle.NORMAL;
            this.fontFamily = "";
            this.textDecoration = [];
            this.wrapLine = !0;
            this.id = "";
            this.nestedCues = [];
            this.spacer = !1
        };
        goog.exportSymbol("shaka.text.Cue", shaka.text.Cue);
        shaka.text.Cue.prototype.clone = function() {
            var a = new shaka.text.Cue(0, 0, ""),
                b;
            for (b in this) a[b] = this[b], a[b] && a[b].constructor == Array && (a[b] = a[b].slice());
            return a
        };
        shaka.text.Cue.equal = function(a, b) {
            if (a.startTime != b.startTime || a.endTime != b.endTime || a.payload != b.payload) return !1;
            for (var c in a)
                if ("startTime" != c && "endTime" != c && "payload" != c)
                    if ("nestedCues" == c) {
                        if (!shaka.util.ArrayUtils.equal(a.nestedCues, b.nestedCues, shaka.text.Cue.equal)) return !1
                    } else if ("region" == c || "cellResolution" == c)
                for (var d in a[c]) {
                    if (a[c][d] != b[c][d]) return !1
                } else if (Array.isArray(a[c])) {
                    if (!shaka.util.ArrayUtils.equal(a[c], b[c])) return !1
                } else if (a[c] != b[c]) return !1;
            return !0
        };
        shaka.text.Cue.positionAlign = {
            LEFT: "line-left",
            RIGHT: "line-right",
            CENTER: "center",
            AUTO: "auto"
        };
        goog.exportProperty(shaka.text.Cue, "positionAlign", shaka.text.Cue.positionAlign);
        shaka.text.Cue.textAlign = {
            LEFT: "left",
            RIGHT: "right",
            CENTER: "center",
            START: "start",
            END: "end"
        };
        goog.exportProperty(shaka.text.Cue, "textAlign", shaka.text.Cue.textAlign);
        shaka.text.Cue.displayAlign = {
            BEFORE: "before",
            CENTER: "center",
            AFTER: "after"
        };
        goog.exportProperty(shaka.text.Cue, "displayAlign", shaka.text.Cue.displayAlign);
        shaka.text.Cue.direction = {
            HORIZONTAL_LEFT_TO_RIGHT: "ltr",
            HORIZONTAL_RIGHT_TO_LEFT: "rtl"
        };
        goog.exportProperty(shaka.text.Cue, "direction", shaka.text.Cue.direction);
        shaka.text.Cue.writingMode = {
            HORIZONTAL_TOP_TO_BOTTOM: "horizontal-tb",
            VERTICAL_LEFT_TO_RIGHT: "vertical-lr",
            VERTICAL_RIGHT_TO_LEFT: "vertical-rl"
        };
        goog.exportProperty(shaka.text.Cue, "writingMode", shaka.text.Cue.writingMode);
        shaka.text.Cue.lineInterpretation = {
            LINE_NUMBER: 0,
            PERCENTAGE: 1
        };
        goog.exportProperty(shaka.text.Cue, "lineInterpretation", shaka.text.Cue.lineInterpretation);
        shaka.text.Cue.lineAlign = {
            CENTER: "center",
            START: "start",
            END: "end"
        };
        goog.exportProperty(shaka.text.Cue, "lineAlign", shaka.text.Cue.lineAlign);
        shaka.text.Cue.fontWeight = {
            NORMAL: 400,
            BOLD: 700
        };
        goog.exportProperty(shaka.text.Cue, "fontWeight", shaka.text.Cue.fontWeight);
        shaka.text.Cue.fontStyle = {
            NORMAL: "normal",
            ITALIC: "italic",
            OBLIQUE: "oblique"
        };
        goog.exportProperty(shaka.text.Cue, "fontStyle", shaka.text.Cue.fontStyle);
        shaka.text.Cue.textDecoration = {
            UNDERLINE: "underline",
            LINE_THROUGH: "lineThrough",
            OVERLINE: "overline"
        };
        goog.exportProperty(shaka.text.Cue, "textDecoration", shaka.text.Cue.textDecoration);
        shaka.text.CueRegion = function() {
            var a = shaka.text.CueRegion;
            this.id = "";
            this.regionAnchorY = this.regionAnchorX = this.viewportAnchorY = this.viewportAnchorX = 0;
            this.height = this.width = 100;
            this.viewportAnchorUnits = this.widthUnits = this.heightUnits = a.units.PERCENTAGE;
            this.scroll = a.scrollMode.NONE
        };
        goog.exportSymbol("shaka.text.CueRegion", shaka.text.CueRegion);
        shaka.text.CueRegion.units = {
            PX: 0,
            PERCENTAGE: 1,
            LINES: 2
        };
        goog.exportProperty(shaka.text.CueRegion, "units", shaka.text.CueRegion.units);
        shaka.text.CueRegion.scrollMode = {
            NONE: "",
            UP: "up"
        };
        goog.exportProperty(shaka.text.CueRegion, "scrollMode", shaka.text.CueRegion.scrollMode);
        shaka.text.TextEngine = function(a) {
            this.parser_ = null;
            this.displayer_ = a;
            this.appendWindowStart_ = this.timestampOffset_ = 0;
            this.appendWindowEnd_ = Infinity;
            this.bufferEnd_ = this.bufferStart_ = null;
            this.selectedClosedCaptionId_ = "";
            this.closedCaptionsMap_ = new Map
        };
        shaka.text.TextEngine.parserMap_ = {};
        shaka.text.TextEngine.registerParser = function(a, b) {
            shaka.text.TextEngine.parserMap_[a] = b
        };
        goog.exportSymbol("shaka.text.TextEngine.registerParser", shaka.text.TextEngine.registerParser);
        shaka.text.TextEngine.unregisterParser = function(a) {
            delete shaka.text.TextEngine.parserMap_[a]
        };
        goog.exportSymbol("shaka.text.TextEngine.unregisterParser", shaka.text.TextEngine.unregisterParser);
        shaka.text.TextEngine.isTypeSupported = function(a) {
            return shaka.text.TextEngine.parserMap_[a] || window.muxjs && a == shaka.util.MimeUtils.CLOSED_CAPTION_MIMETYPE ? !0 : !1
        };
        shaka.text.TextEngine.prototype.destroy = function() {
            this.displayer_ = this.parser_ = null;
            this.closedCaptionsMap_.clear();
            return Promise.resolve()
        };
        shaka.text.TextEngine.prototype.setDisplayer = function(a) {
            this.displayer_ = a
        };
        shaka.text.TextEngine.prototype.initParser = function(a) {
            a != shaka.util.MimeUtils.CLOSED_CAPTION_MIMETYPE && (a = shaka.text.TextEngine.parserMap_[a], goog.asserts.assert(a, "Text type negotiation should have happened already"), this.parser_ = new a)
        };
        shaka.text.TextEngine.prototype.getStartTime = function(a) {
            goog.asserts.assert(this.parser_, "The parser should already be initialized");
            var b = {
                periodStart: 0,
                segmentStart: null,
                segmentEnd: 0
            };
            try {
                return this.parser_.parseMedia(new Uint8Array(a), b)[0].startTime
            } catch (c) {
                throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.UNABLE_TO_EXTRACT_CUE_START_TIME, c);
            }
        };
        shaka.text.TextEngine.prototype.appendBuffer = function(a, b, c) {
            goog.asserts.assert(this.parser_, "The parser should already be initialized");
            return Promise.resolve().then(function() {
                if (this.parser_ && this.displayer_)
                    if (null == b || null == c) this.parser_.parseInit(new Uint8Array(a));
                    else {
                        var d = {
                            periodStart: this.timestampOffset_,
                            segmentStart: b,
                            segmentEnd: c
                        };
                        d = this.parser_.parseMedia(new Uint8Array(a), d).filter(function(a) {
                            return a.startTime >= this.appendWindowStart_ && a.startTime < this.appendWindowEnd_
                        }.bind(this));
                        this.displayer_.append(d);
                        null == this.bufferStart_ ? this.bufferStart_ = Math.max(b, this.appendWindowStart_) : (goog.asserts.assert(null != this.bufferEnd_, "There should already be a buffered range end."), goog.asserts.assert(1 >= b - this.bufferEnd_, "There should not be a gap in text references >1s"));
                        this.bufferEnd_ = Math.min(c, this.appendWindowEnd_)
                    }
            }.bind(this))
        };
        shaka.text.TextEngine.prototype.remove = function(a, b) {
            return Promise.resolve().then(function() {
                this.displayer_ && this.displayer_.remove(a, b) && (null == this.bufferStart_ ? goog.asserts.assert(null == this.bufferEnd_, "end must be null if startTime is null") : (goog.asserts.assert(null != this.bufferEnd_, "end must be non-null if startTime is non-null"), b <= this.bufferStart_ || a >= this.bufferEnd_ || (a <= this.bufferStart_ && b >= this.bufferEnd_ ? this.bufferStart_ = this.bufferEnd_ = null : a <= this.bufferStart_ && b < this.bufferEnd_ ?
                    this.bufferStart_ = b : a > this.bufferStart_ && b >= this.bufferEnd_ ? this.bufferEnd_ = a : goog.asserts.assert(!1, "removal from the middle is not supported by TextEngine"))))
            }.bind(this))
        };
        shaka.text.TextEngine.prototype.setTimestampOffset = function(a) {
            this.timestampOffset_ = a
        };
        shaka.text.TextEngine.prototype.setAppendWindow = function(a, b) {
            this.appendWindowStart_ = a;
            this.appendWindowEnd_ = b
        };
        shaka.text.TextEngine.prototype.bufferStart = function() {
            return this.bufferStart_
        };
        shaka.text.TextEngine.prototype.bufferEnd = function() {
            return this.bufferEnd_
        };
        shaka.text.TextEngine.prototype.isBuffered = function(a) {
            return null == this.bufferStart_ || null == this.bufferEnd_ ? !1 : a >= this.bufferStart_ && a < this.bufferEnd_
        };
        shaka.text.TextEngine.prototype.bufferedAheadOf = function(a) {
            if (null == this.bufferEnd_ || this.bufferEnd_ < a) return 0;
            goog.asserts.assert(null != this.bufferStart_, "start should not be null if end is not null");
            return this.bufferEnd_ - Math.max(a, this.bufferStart_)
        };
        shaka.text.TextEngine.prototype.setSelectedClosedCaptionId = function(a, b) {
            this.selectedClosedCaptionId_ = a;
            var c = this.closedCaptionsMap_.get(a);
            if (c)
                for (var d = $jscomp.makeIterator(c.keys()), e = d.next(); !e.done; e = d.next())(e = c.get(e.value).filter(function(a) {
                    return a.endTime <= b
                })) && this.displayer_.append(e)
        };
        shaka.text.TextEngine.prototype.storeAndAppendClosedCaptions = function(a, b, c, d) {
            var e = b + " " + c,
                f = new Map;
            a = $jscomp.makeIterator(a);
            for (var g = a.next(); !g.done; g = a.next()) {
                var h = g.value;
                g = h.stream;
                f.has(g) || f.set(g, new Map);
                f.get(g).has(e) || f.get(g).set(e, []);
                h.startTime += d;
                h.endTime += d;
                h.startTime >= this.appendWindowStart_ && h.startTime < this.appendWindowEnd_ && (h = new shaka.text.Cue(h.startTime, h.endTime, h.text), f.get(g).get(e).push(h), g == this.selectedClosedCaptionId_ && this.displayer_.append([h]))
            }
            d = $jscomp.makeIterator(f.keys());
            for (e = d.next(); !e.done; e = d.next())
                for (e = e.value, this.closedCaptionsMap_.has(e) || this.closedCaptionsMap_.set(e, new Map), a = $jscomp.makeIterator(f.get(e).keys()), g = a.next(); !g.done; g = a.next()) g = g.value, h = f.get(e).get(g), this.closedCaptionsMap_.get(e).set(g, h);
            this.bufferStart_ = null == this.bufferStart_ ? Math.max(b, this.appendWindowStart_) : Math.min(this.bufferStart_, Math.max(b, this.appendWindowStart_));
            this.bufferEnd_ = Math.max(this.bufferEnd_, Math.min(c, this.appendWindowEnd_))
        };
        shaka.text.TextEngine.prototype.getNumberOfClosedCaptionChannels = function() {
            return this.closedCaptionsMap_.size
        };
        shaka.text.TextEngine.prototype.getNumberOfClosedCaptionsInChannel = function(a) {
            return (a = this.closedCaptionsMap_.get(a)) ? a.size : 0
        };
        shaka.media.MediaSourceEngine = function(a, b, c) {
            this.video_ = a;
            this.textDisplayer_ = c;
            this.sourceBuffers_ = {};
            this.textEngine_ = null;
            this.queues_ = {};
            this.eventManager_ = new shaka.util.EventManager;
            this.destroyed_ = !1;
            this.transmuxers_ = {};
            this.captionParser_ = b;
            this.mediaSourceOpen_ = new shaka.util.PublicPromise;
            this.mediaSource_ = this.createMediaSource(this.mediaSourceOpen_);
            this.url_ = ""
        };
        shaka.media.MediaSourceEngine.createObjectURL = window.URL.createObjectURL;
        shaka.media.MediaSourceEngine.prototype.createMediaSource = function(a) {
            var b = this,
                c = new MediaSource;
            this.eventManager_.listenOnce(c, "sourceopen", function() {
                return b.onSourceOpen_(a)
            });
            this.url_ = shaka.media.MediaSourceEngine.createObjectURL(c);
            this.video_.src = this.url_;
            return c
        };
        shaka.media.MediaSourceEngine.prototype.onSourceOpen_ = function(a) {
            URL.revokeObjectURL(this.url_);
            a.resolve()
        };
        shaka.media.MediaSourceEngine.isStreamSupported = function(a) {
            var b = shaka.util.MimeUtils.getFullType(a.mimeType, a.codecs),
                c = shaka.util.MimeUtils.getExtendedType(a);
            return shaka.text.TextEngine.isTypeSupported(b) || MediaSource.isTypeSupported(c) || shaka.media.Transmuxer.isSupported(b, a.type)
        };
        shaka.media.MediaSourceEngine.probeSupport = function() {
            for (var a = {}, b = $jscomp.makeIterator('video/mp4; codecs="avc1.42E01E",video/mp4; codecs="avc3.42E01E",video/mp4; codecs="hev1.1.6.L93.90",video/mp4; codecs="hvc1.1.6.L93.90",video/mp4; codecs="hev1.2.4.L153.B0"; eotf="smpte2084",video/mp4; codecs="hvc1.2.4.L153.B0"; eotf="smpte2084",video/mp4; codecs="vp9",video/mp4; codecs="vp09.00.10.08",video/mp4; codecs="av01.0.01M.08",audio/mp4; codecs="mp4a.40.2",audio/mp4; codecs="ac-3",audio/mp4; codecs="ec-3",audio/mp4; codecs="opus",audio/mp4; codecs="flac",video/webm; codecs="vp8",video/webm; codecs="vp9",video/webm; codecs="vp09.00.10.08",audio/webm; codecs="vorbis",audio/webm; codecs="opus",video/mp2t; codecs="avc1.42E01E",video/mp2t; codecs="avc3.42E01E",video/mp2t; codecs="hvc1.1.6.L93.90",video/mp2t; codecs="mp4a.40.2",video/mp2t; codecs="ac-3",video/mp2t; codecs="ec-3",text/vtt,application/mp4; codecs="wvtt",application/ttml+xml,application/mp4; codecs="stpp"'.split(",")), c =
                    b.next(); !c.done; c = b.next()) {
                c = c.value;
                shaka.util.Platform.supportsMediaSource() ? shaka.text.TextEngine.isTypeSupported(c) ? a[c] = !0 : a[c] = MediaSource.isTypeSupported(c) || shaka.media.Transmuxer.isSupported(c) : a[c] = shaka.util.Platform.supportsMediaType(c);
                var d = c.split(";")[0];
                a[d] = a[d] || a[c]
            }
            return a
        };
        shaka.media.MediaSourceEngine.prototype.destroy = function() {
            var a = this,
                b = shaka.util.Functional;
            this.destroyed_ = !0;
            var c = [],
                d;
            for (d in this.queues_) {
                var e = this.queues_[d],
                    f = e[0];
                this.queues_[d] = e.slice(0, 1);
                f && c.push(f.p["catch"](b.noop));
                for (f = 1; f < e.length; ++f) e[f].p.reject()
            }
            this.textEngine_ && c.push(this.textEngine_.destroy());
            this.textDisplayer_ && c.push(this.textDisplayer_.destroy());
            for (var g in this.transmuxers_) c.push(this.transmuxers_[g].destroy());
            return Promise.all(c).then(function() {
                a.eventManager_ &&
                    (a.eventManager_.release(), a.eventManager_ = null);
                a.video_ && (a.video_.removeAttribute("src"), a.video_.load(), a.video_ = null);
                a.mediaSource_ = null;
                a.textEngine_ = null;
                a.textDisplayer_ = null;
                a.sourceBuffers_ = {};
                a.transmuxers_ = {};
                a.captionParser_ = null;
                if (goog.DEBUG)
                    for (var b in a.queues_) goog.asserts.assert(0 == a.queues_[b].length, b + " queue should be empty after destroy!");
                a.queues_ = {}
            })
        };
        shaka.media.MediaSourceEngine.prototype.open = function() {
            return this.mediaSourceOpen_
        };
        shaka.media.MediaSourceEngine.prototype.init = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return f = shaka.util.ManifestParserUtils.ContentType, e.yield(c.mediaSourceOpen_, 2);
                        case 2:
                            a.forEach(function(a, e) {
                                goog.asserts.assert(shaka.media.MediaSourceEngine.isStreamSupported(a), "Type negotiation should happen before MediaSourceEngine.init!");
                                var g = shaka.util.MimeUtils.getFullType(a.mimeType,
                                    a.codecs);
                                e == f.TEXT ? c.reinitText(g) : (!b && MediaSource.isTypeSupported(g) || !shaka.media.Transmuxer.isSupported(g, e) || (c.transmuxers_[e] = new shaka.media.Transmuxer, g = shaka.media.Transmuxer.convertTsCodecs(e, g)), g = c.mediaSource_.addSourceBuffer(g), c.eventManager_.listen(g, "error", c.onError_.bind(c, e)), c.eventManager_.listen(g, "updateend", c.onUpdateEnd_.bind(c, e)), c.sourceBuffers_[e] = g, c.queues_[e] = [])
                            }), e.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.MediaSourceEngine.prototype.reinitText = function(a) {
            this.textEngine_ || (this.textEngine_ = new shaka.text.TextEngine(this.textDisplayer_));
            this.textEngine_.initParser(a)
        };
        shaka.media.MediaSourceEngine.prototype.ended = function() {
            return this.mediaSource_ ? "ended" == this.mediaSource_.readyState : !0
        };
        shaka.media.MediaSourceEngine.prototype.bufferStart = function(a) {
            return a == shaka.util.ManifestParserUtils.ContentType.TEXT ? this.textEngine_.bufferStart() : shaka.media.TimeRangesUtils.bufferStart(this.getBuffered_(a))
        };
        shaka.media.MediaSourceEngine.prototype.bufferEnd = function(a) {
            return a == shaka.util.ManifestParserUtils.ContentType.TEXT ? this.textEngine_.bufferEnd() : shaka.media.TimeRangesUtils.bufferEnd(this.getBuffered_(a))
        };
        shaka.media.MediaSourceEngine.prototype.isBuffered = function(a, b, c) {
            if (a == shaka.util.ManifestParserUtils.ContentType.TEXT) return this.textEngine_.isBuffered(b);
            a = this.getBuffered_(a);
            return shaka.media.TimeRangesUtils.isBuffered(a, b, c)
        };
        shaka.media.MediaSourceEngine.prototype.bufferedAheadOf = function(a, b) {
            if (a == shaka.util.ManifestParserUtils.ContentType.TEXT) return this.textEngine_.bufferedAheadOf(b);
            var c = this.getBuffered_(a);
            return shaka.media.TimeRangesUtils.bufferedAheadOf(c, b)
        };
        shaka.media.MediaSourceEngine.prototype.getBufferedInfo = function(a) {
            var b = shaka.util.ManifestParserUtils.ContentType,
                c = shaka.media.TimeRangesUtils.getBufferedInfo;
            a.total = c(this.video_.buffered);
            a.audio = c(this.getBuffered_(b.AUDIO));
            a.video = c(this.getBuffered_(b.VIDEO));
            a.text = [];
            this.textEngine_ && (b = this.textEngine_.bufferStart(), c = this.textEngine_.bufferEnd(), null != b && null != c && a.text.push({
                start: b,
                end: c
            }))
        };
        shaka.media.MediaSourceEngine.prototype.getBuffered_ = function(a) {
            try {
                return this.sourceBuffers_[a].buffered
            } catch (b) {
                return a in this.sourceBuffers_ && shaka.log.error("failed to get buffered range for " + a, b), null
            }
        };
        shaka.media.MediaSourceEngine.prototype.appendBuffer = function(a, b, c, d, e) {
            var f = this,
                g = shaka.util.ManifestParserUtils.ContentType;
            if (a == g.TEXT) return this.textEngine_.appendBuffer(b, c, d);
            if (this.transmuxers_[a]) return this.transmuxers_[a].transmux(b).then(function(b) {
                this.textEngine_ || this.reinitText("text/vtt");
                b.captions && b.captions.length && this.textEngine_.storeAndAppendClosedCaptions(b.captions, c, d, this.sourceBuffers_[g.VIDEO].timestampOffset);
                return this.enqueueOperation_(a, this.append_.bind(this,
                    a, b.data.buffer))
            }.bind(this));
            e && window.muxjs && (this.textEngine_ || this.reinitText("text/vtt"), null == c && null == d ? this.captionParser_.init(b) : this.captionParser_.parseFrom(b, function(a) {
                a.length && f.textEngine_.storeAndAppendClosedCaptions(a, c, d, f.sourceBuffers_[g.VIDEO].timestampOffset)
            }));
            return this.enqueueOperation_(a, this.append_.bind(this, a, b))
        };
        shaka.media.MediaSourceEngine.prototype.setSelectedClosedCaptionId = function(a) {
            var b = this.bufferEnd(shaka.util.ManifestParserUtils.ContentType.VIDEO) || 0;
            this.textEngine_.setSelectedClosedCaptionId(a, b)
        };
        shaka.media.MediaSourceEngine.prototype.remove = function(a, b, c) {
            goog.asserts.assert(c < Number.MAX_VALUE, "remove() with MAX_VALUE or Infinity is not IE-compatible!");
            return a == shaka.util.ManifestParserUtils.ContentType.TEXT ? this.textEngine_.remove(b, c) : this.enqueueOperation_(a, this.remove_.bind(this, a, b, c))
        };
        shaka.media.MediaSourceEngine.prototype.clear = function(a) {
            if (a == shaka.util.ManifestParserUtils.ContentType.TEXT) {
                if (!this.textEngine_) return Promise.resolve();
                this.captionParser_.reset();
                return this.textEngine_.remove(0, Infinity)
            }
            return this.enqueueOperation_(a, this.remove_.bind(this, a, 0, this.mediaSource_.duration))
        };
        shaka.media.MediaSourceEngine.prototype.flush = function(a) {
            return a == shaka.util.ManifestParserUtils.ContentType.TEXT ? Promise.resolve() : this.enqueueOperation_(a, this.flush_.bind(this, a))
        };
        shaka.media.MediaSourceEngine.prototype.setStreamProperties = function(a, b, c, d) {
            return a == shaka.util.ManifestParserUtils.ContentType.TEXT ? (this.textEngine_.setTimestampOffset(b), this.textEngine_.setAppendWindow(c, d), Promise.resolve()) : Promise.all([this.enqueueOperation_(a, this.abort_.bind(this, a)), this.enqueueOperation_(a, this.setTimestampOffset_.bind(this, a, b)), this.enqueueOperation_(a, this.setAppendWindow_.bind(this, a, c, d))])
        };
        shaka.media.MediaSourceEngine.prototype.endOfStream = function(a) {
            return this.enqueueBlockingOperation_(function() {
                this.ended() || (a ? this.mediaSource_.endOfStream(a) : this.mediaSource_.endOfStream())
            }.bind(this))
        };
        shaka.media.MediaSourceEngine.prototype.setDuration = function(a) {
            goog.asserts.assert(isNaN(this.mediaSource_.duration) || this.mediaSource_.duration <= a, "duration cannot decrease: " + this.mediaSource_.duration + " -> " + a);
            return this.enqueueBlockingOperation_(function() {
                this.mediaSource_.duration = a
            }.bind(this))
        };
        shaka.media.MediaSourceEngine.prototype.getDuration = function() {
            return this.mediaSource_.duration
        };
        shaka.media.MediaSourceEngine.prototype.append_ = function(a, b) {
            this.sourceBuffers_[a].appendBuffer(b)
        };
        shaka.media.MediaSourceEngine.prototype.remove_ = function(a, b, c) {
            if (c <= b) this.onUpdateEnd_(a);
            else this.sourceBuffers_[a].remove(b, c)
        };
        shaka.media.MediaSourceEngine.prototype.abort_ = function(a) {
            var b = this.sourceBuffers_[a].appendWindowStart,
                c = this.sourceBuffers_[a].appendWindowEnd;
            this.sourceBuffers_[a].abort();
            this.sourceBuffers_[a].appendWindowStart = b;
            this.sourceBuffers_[a].appendWindowEnd = c;
            this.onUpdateEnd_(a)
        };
        shaka.media.MediaSourceEngine.prototype.flush_ = function(a) {
            goog.asserts.assert(0 == this.video_.buffered.length, "MediaSourceEngine.flush_ should only be used after clearing all data!");
            this.video_.currentTime -= .001;
            this.onUpdateEnd_(a)
        };
        shaka.media.MediaSourceEngine.prototype.setTimestampOffset_ = function(a, b) {
            0 > b && (b += .001);
            this.sourceBuffers_[a].timestampOffset = b;
            this.onUpdateEnd_(a)
        };
        shaka.media.MediaSourceEngine.prototype.setAppendWindow_ = function(a, b, c) {
            this.sourceBuffers_[a].appendWindowStart = 0;
            this.sourceBuffers_[a].appendWindowEnd = c;
            this.sourceBuffers_[a].appendWindowStart = b;
            this.onUpdateEnd_(a)
        };
        shaka.media.MediaSourceEngine.prototype.onError_ = function(a, b) {
            var c = this.queues_[a][0];
            goog.asserts.assert(c, "Spurious error event!");
            goog.asserts.assert(!this.sourceBuffers_[a].updating, "SourceBuffer should not be updating on error!");
            c.p.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.MEDIA_SOURCE_OPERATION_FAILED, this.video_.error ? this.video_.error.code : 0))
        };
        shaka.media.MediaSourceEngine.prototype.onUpdateEnd_ = function(a) {
            var b = this.queues_[a][0];
            goog.asserts.assert(b, "Spurious updateend event!");
            b && (goog.asserts.assert(!this.sourceBuffers_[a].updating, "SourceBuffer should not be updating on updateend!"), b.p.resolve(), this.popFromQueue_(a))
        };
        shaka.media.MediaSourceEngine.prototype.enqueueOperation_ = function(a, b) {
            if (this.destroyed_) return Promise.reject();
            var c = {
                start: b,
                p: new shaka.util.PublicPromise
            };
            this.queues_[a].push(c);
            if (1 == this.queues_[a].length) try {
                c.start()
            } catch (d) {
                "QuotaExceededError" == d.name ? c.p.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.QUOTA_EXCEEDED_ERROR, a)) : c.p.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA,
                    shaka.util.Error.Code.MEDIA_SOURCE_OPERATION_THREW, d)), this.popFromQueue_(a)
            }
            return c.p
        };
        shaka.media.MediaSourceEngine.prototype.enqueueBlockingOperation_ = function(a) {
            if (this.destroyed_) return Promise.reject();
            var b = [],
                c;
            for (c in this.sourceBuffers_) {
                var d = new shaka.util.PublicPromise,
                    e = {
                        start: function(a) {
                            a.resolve()
                        }.bind(null, d),
                        p: d
                    };
                this.queues_[c].push(e);
                b.push(d);
                1 == this.queues_[c].length && e.start()
            }
            return Promise.all(b).then(function() {
                if (goog.DEBUG)
                    for (var b in this.sourceBuffers_) goog.asserts.assert(0 == this.sourceBuffers_[b].updating, "SourceBuffers should not be updating after a blocking op!");
                try {
                    a()
                } catch (k) {
                    var c = Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.MEDIA_SOURCE_OPERATION_THREW, k))
                }
                for (var d in this.sourceBuffers_) this.popFromQueue_(d);
                return c
            }.bind(this), function(a) {
                goog.asserts.assert(this.destroyed_, "Should be destroyed by now");
                if (goog.DEBUG)
                    for (var c in this.sourceBuffers_) this.queues_[c].length && (goog.asserts.assert(1 == this.queues_[c].length, "Should be at most one item in queue!"), goog.asserts.assert(b.includes(this.queues_[c][0].p),
                        "The item in queue should be one of our waiters!"), this.queues_[c].shift());
                throw a;
            }.bind(this))
        };
        shaka.media.MediaSourceEngine.prototype.popFromQueue_ = function(a) {
            this.queues_[a].shift();
            var b = this.queues_[a][0];
            if (b) try {
                b.start()
            } catch (c) {
                b.p.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.MEDIA_SOURCE_OPERATION_THREW, c)), this.popFromQueue_(a)
            }
        };
        shaka.media.MediaSourceEngine.prototype.getTextDisplayer = function() {
            goog.asserts.assert(this.textDisplayer_, "TextDisplayer should only be null when this is destroyed");
            return this.textDisplayer_
        };
        shaka.media.MediaSourceEngine.prototype.setTextDisplayer = function(a) {
            var b = this.textDisplayer_;
            this.textDisplayer_ = a;
            b && (a.setTextVisibility(b.isTextVisible()), b.destroy());
            this.textEngine_ && this.textEngine_.setDisplayer(a)
        };
        shaka.util.LanguageUtils = function() {};
        shaka.util.LanguageUtils.areLocaleCompatible = function(a, b) {
            var c = shaka.util.LanguageUtils;
            a = c.normalize(a);
            b = c.normalize(b);
            return a == b
        };
        shaka.util.LanguageUtils.areLanguageCompatible = function(a, b) {
            var c = shaka.util.LanguageUtils;
            a = c.normalize(a);
            b = c.normalize(b);
            var d = c.disassembleLocale_(a);
            c = c.disassembleLocale_(b);
            return d[0] == c[0]
        };
        shaka.util.LanguageUtils.isParentOf = function(a, b) {
            var c = shaka.util.LanguageUtils;
            a = c.normalize(a);
            b = c.normalize(b);
            var d = c.disassembleLocale_(a);
            c = c.disassembleLocale_(b);
            return d[0] == c[0] && 1 == d.length && 2 == c.length
        };
        shaka.util.LanguageUtils.isSiblingOf = function(a, b) {
            var c = shaka.util.LanguageUtils;
            a = c.normalize(a);
            b = c.normalize(b);
            var d = c.disassembleLocale_(a);
            c = c.disassembleLocale_(b);
            return 2 == d.length && 2 == c.length && d[0] == c[0]
        };
        shaka.util.LanguageUtils.normalize = function(a) {
            var b = shaka.util.LanguageUtils,
                c = a.split("-");
            a = c[0] || "";
            c = c[1] || "";
            a = a.toLowerCase();
            a = b.isoMap_.get(a) || a;
            return (c = c.toUpperCase()) ? a + "-" + c : a
        };
        shaka.util.LanguageUtils.areSiblings = function(a, b) {
            var c = shaka.util.LanguageUtils,
                d = c.getBase(a);
            c = c.getBase(b);
            return a != d && b != c && d == c
        };
        shaka.util.LanguageUtils.getBase = function(a) {
            var b = shaka.util.LanguageUtils,
                c = a.indexOf("-");
            a = 0 <= c ? a.substring(0, c) : a;
            a = a.toLowerCase();
            return a = b.isoMap_.get(a) || a
        };
        shaka.util.LanguageUtils.getLocaleForText = function(a) {
            var b = shaka.util.LanguageUtils;
            goog.asserts.assert(a.type == shaka.util.ManifestParserUtils.ContentType.TEXT, "Can only get language from text streams");
            return b.normalize(a.language || "und")
        };
        shaka.util.LanguageUtils.getLocaleForVariant = function(a) {
            var b = shaka.util.LanguageUtils;
            return a.language ? b.normalize(a.language) : a.audio && a.audio.language ? b.normalize(a.audio.language) : a.video && a.video.language ? b.normalize(a.video.language) : "und"
        };
        shaka.util.LanguageUtils.findClosestLocale = function(a, b) {
            for (var c = shaka.util.LanguageUtils, d = c.normalize(a), e = new Set, f = $jscomp.makeIterator(b), g = f.next(); !g.done; g = f.next()) e.add(c.normalize(g.value));
            f = $jscomp.makeIterator(e);
            for (g = f.next(); !g.done; g = f.next())
                if (g = g.value, g == d) return g;
            f = $jscomp.makeIterator(e);
            for (g = f.next(); !g.done; g = f.next())
                if (g = g.value, c.isParentOf(g, d)) return g;
            f = $jscomp.makeIterator(e);
            for (g = f.next(); !g.done; g = f.next())
                if (g = g.value, c.isSiblingOf(g, d)) return g;
            e = $jscomp.makeIterator(e);
            for (g = e.next(); !g.done; g = e.next())
                if (g = g.value, c.isParentOf(d, g)) return g;
            return null
        };
        shaka.util.LanguageUtils.disassembleLocale_ = function(a) {
            var b = a.split("-");
            goog.asserts.assert(2 >= b.length, ["Locales should not have more than 2 components. ", a, " has too many components."].join());
            return b
        };
        shaka.util.LanguageUtils.isoMap_ = new Map([
            ["aar", "aa"],
            ["abk", "ab"],
            ["afr", "af"],
            ["aka", "ak"],
            ["alb", "sq"],
            ["amh", "am"],
            ["ara", "ar"],
            ["arg", "an"],
            ["arm", "hy"],
            ["asm", "as"],
            ["ava", "av"],
            ["ave", "ae"],
            ["aym", "ay"],
            ["aze", "az"],
            ["bak", "ba"],
            ["bam", "bm"],
            ["baq", "eu"],
            ["bel", "be"],
            ["ben", "bn"],
            ["bih", "bh"],
            ["bis", "bi"],
            ["bod", "bo"],
            ["bos", "bs"],
            ["bre", "br"],
            ["bul", "bg"],
            ["bur", "my"],
            ["cat", "ca"],
            ["ces", "cs"],
            ["cha", "ch"],
            ["che", "ce"],
            ["chi", "zh"],
            ["chu", "cu"],
            ["chv", "cv"],
            ["cor", "kw"],
            ["cos", "co"],
            ["cre",
                "cr"
            ],
            ["cym", "cy"],
            ["cze", "cs"],
            ["dan", "da"],
            ["deu", "de"],
            ["div", "dv"],
            ["dut", "nl"],
            ["dzo", "dz"],
            ["ell", "el"],
            ["eng", "en"],
            ["epo", "eo"],
            ["est", "et"],
            ["eus", "eu"],
            ["ewe", "ee"],
            ["fao", "fo"],
            ["fas", "fa"],
            ["fij", "fj"],
            ["fin", "fi"],
            ["fra", "fr"],
            ["fre", "fr"],
            ["fry", "fy"],
            ["ful", "ff"],
            ["geo", "ka"],
            ["ger", "de"],
            ["gla", "gd"],
            ["gle", "ga"],
            ["glg", "gl"],
            ["glv", "gv"],
            ["gre", "el"],
            ["grn", "gn"],
            ["guj", "gu"],
            ["hat", "ht"],
            ["hau", "ha"],
            ["heb", "he"],
            ["her", "hz"],
            ["hin", "hi"],
            ["hmo", "ho"],
            ["hrv", "hr"],
            ["hun", "hu"],
            ["hye",
                "hy"
            ],
            ["ibo", "ig"],
            ["ice", "is"],
            ["ido", "io"],
            ["iii", "ii"],
            ["iku", "iu"],
            ["ile", "ie"],
            ["ina", "ia"],
            ["ind", "id"],
            ["ipk", "ik"],
            ["isl", "is"],
            ["ita", "it"],
            ["jav", "jv"],
            ["jpn", "ja"],
            ["kal", "kl"],
            ["kan", "kn"],
            ["kas", "ks"],
            ["kat", "ka"],
            ["kau", "kr"],
            ["kaz", "kk"],
            ["khm", "km"],
            ["kik", "ki"],
            ["kin", "rw"],
            ["kir", "ky"],
            ["kom", "kv"],
            ["kon", "kg"],
            ["kor", "ko"],
            ["kua", "kj"],
            ["kur", "ku"],
            ["lao", "lo"],
            ["lat", "la"],
            ["lav", "lv"],
            ["lim", "li"],
            ["lin", "ln"],
            ["lit", "lt"],
            ["ltz", "lb"],
            ["lub", "lu"],
            ["lug", "lg"],
            ["mac", "mk"],
            ["mah",
                "mh"
            ],
            ["mal", "ml"],
            ["mao", "mi"],
            ["mar", "mr"],
            ["may", "ms"],
            ["mkd", "mk"],
            ["mlg", "mg"],
            ["mlt", "mt"],
            ["mon", "mn"],
            ["mri", "mi"],
            ["msa", "ms"],
            ["mya", "my"],
            ["nau", "na"],
            ["nav", "nv"],
            ["nbl", "nr"],
            ["nde", "nd"],
            ["ndo", "ng"],
            ["nep", "ne"],
            ["nld", "nl"],
            ["nno", "nn"],
            ["nob", "nb"],
            ["nor", "no"],
            ["nya", "ny"],
            ["oci", "oc"],
            ["oji", "oj"],
            ["ori", "or"],
            ["orm", "om"],
            ["oss", "os"],
            ["pan", "pa"],
            ["per", "fa"],
            ["pli", "pi"],
            ["pol", "pl"],
            ["por", "pt"],
            ["pus", "ps"],
            ["que", "qu"],
            ["roh", "rm"],
            ["ron", "ro"],
            ["rum", "ro"],
            ["run", "rn"],
            ["rus",
                "ru"
            ],
            ["sag", "sg"],
            ["san", "sa"],
            ["sin", "si"],
            ["slk", "sk"],
            ["slo", "sk"],
            ["slv", "sl"],
            ["sme", "se"],
            ["smo", "sm"],
            ["sna", "sn"],
            ["snd", "sd"],
            ["som", "so"],
            ["sot", "st"],
            ["spa", "es"],
            ["sqi", "sq"],
            ["srd", "sc"],
            ["srp", "sr"],
            ["ssw", "ss"],
            ["sun", "su"],
            ["swa", "sw"],
            ["swe", "sv"],
            ["tah", "ty"],
            ["tam", "ta"],
            ["tat", "tt"],
            ["tel", "te"],
            ["tgk", "tg"],
            ["tgl", "tl"],
            ["tha", "th"],
            ["tib", "bo"],
            ["tir", "ti"],
            ["ton", "to"],
            ["tsn", "tn"],
            ["tso", "ts"],
            ["tuk", "tk"],
            ["tur", "tr"],
            ["twi", "tw"],
            ["uig", "ug"],
            ["ukr", "uk"],
            ["urd", "ur"],
            ["uzb",
                "uz"
            ],
            ["ven", "ve"],
            ["vie", "vi"],
            ["vol", "vo"],
            ["wel", "cy"],
            ["wln", "wa"],
            ["wol", "wo"],
            ["xho", "xh"],
            ["yid", "yi"],
            ["yor", "yo"],
            ["zha", "za"],
            ["zho", "zh"],
            ["zul", "zu"]
        ]);
        shaka.util.StreamUtils = {};
        shaka.util.StreamUtils.chooseCodecsAndFilterManifest = function(a, b) {
            function c(a) {
                var b = "";
                a.video && (b = d.getCodecBase(a.video.codecs));
                var c = "";
                a.audio && (c = d.getCodecBase(a.audio.codecs));
                return b + "-" + c
            }
            var d = shaka.util.MimeUtils,
                e = a.periods.reduce(function(a, b) {
                    return a.concat(b.variants)
                }, []);
            e = shaka.util.StreamUtils.filterVariantsByAudioChannelCount(e, b);
            var f = new shaka.util.MultiMap;
            e = $jscomp.makeIterator(e);
            for (var g = e.next(); !g.done; g = e.next()) {
                g = g.value;
                var h = c(g);
                f.push(h, g)
            }
            var k = null,
                l = Infinity;
            f.forEach(function(a, b) {
                for (var c = 0, d = 0, e = $jscomp.makeIterator(b), f = e.next(); !f.done; f = e.next()) c += f.value.bandwidth || 0, ++d;
                c /= d;
                shaka.log.debug("codecs", a, "avg bandwidth", c);
                c < l && (k = a, l = c)
            });
            goog.asserts.assert(null != k, "Should have chosen codecs!");
            goog.asserts.assert(!isNaN(l), "Bandwidth should be a number!");
            f = $jscomp.makeIterator(a.periods);
            for (e = f.next(); !e.done; e = f.next()) e = e.value, e.variants = e.variants.filter(function(a) {
                if (c(a) == k) return !0;
                shaka.log.debug("Dropping Variant (better codec available)",
                    a);
                return !1
            })
        };
        shaka.util.StreamUtils.meetsRestrictions = function(a, b, c) {
            var d = function(a, b, c) {
                    return a >= b && a <= c
                },
                e = a.video;
            return e && e.width && e.height && (!d(e.width, b.minWidth, Math.min(b.maxWidth, c.width)) || !d(e.height, b.minHeight, Math.min(b.maxHeight, c.height)) || !d(e.width * e.height, b.minPixels, b.maxPixels)) || a && a.video && a.video.frameRate && !d(a.video.frameRate, b.minFrameRate, b.maxFrameRate) || !d(a.bandwidth, b.minBandwidth, b.maxBandwidth) ? !1 : !0
        };
        shaka.util.StreamUtils.applyRestrictions = function(a, b, c) {
            var d = !1;
            a.forEach(function(a) {
                var e = a.allowedByApplication;
                a.allowedByApplication = shaka.util.StreamUtils.meetsRestrictions(a, b, c);
                e != a.allowedByApplication && (d = !0)
            });
            return d
        };
        shaka.util.StreamUtils.filterNewPeriod = function(a, b, c, d) {
            var e = shaka.util.StreamUtils;
            b && goog.asserts.assert(e.isAudio(b), "Audio streams must have the audio type.");
            c && goog.asserts.assert(e.isVideo(c), "Video streams must have the video type.");
            d.variants = d.variants.filter(function(d) {
                if (a && a.initialized() && !a.supportsVariant(d)) return shaka.log.debug("Dropping variant - not compatible with key system", d), !1;
                var f = d.audio;
                d = d.video;
                return f && !shaka.media.MediaSourceEngine.isStreamSupported(f) ? (shaka.log.debug("Dropping variant - audio not compatible with platform",
                    e.getStreamSummaryString_(f)), !1) : d && !shaka.media.MediaSourceEngine.isStreamSupported(d) ? (shaka.log.debug("Dropping variant - video not compatible with platform", e.getStreamSummaryString_(d)), !1) : f && b && !e.areStreamsCompatible_(f, b) ? (shaka.log.debug("Droping variant - not compatible with active audio", "active audio", e.getStreamSummaryString_(b), "variant.audio", e.getStreamSummaryString_(f)), !1) : d && c && !e.areStreamsCompatible_(d, c) ? (shaka.log.debug("Droping variant - not compatible with active video",
                    "active video", e.getStreamSummaryString_(c), "variant.video", e.getStreamSummaryString_(d)), !1) : !0
            });
            d.textStreams = d.textStreams.filter(function(a) {
                var b = shaka.util.MimeUtils.getFullType(a.mimeType, a.codecs);
                (b = shaka.text.TextEngine.isTypeSupported(b)) || shaka.log.debug("Dropping text stream. Is not supported by the platform.", a);
                return b
            })
        };
        shaka.util.StreamUtils.areStreamsCompatible_ = function(a, b) {
            return a.mimeType != b.mimeType || a.codecs.split(".")[0] != b.codecs.split(".")[0] ? !1 : !0
        };
        shaka.util.StreamUtils.variantToTrack = function(a) {
            var b = a.audio,
                c = a.video,
                d = b ? b.codecs : null,
                e = c ? c.codecs : null,
                f = [];
            e && f.push(e);
            d && f.push(d);
            var g = [];
            c && g.push(c.mimeType);
            b && g.push(b.mimeType);
            g = g[0] || null;
            var h = [];
            b && h.push(b.kind);
            c && h.push(c.kind);
            h = h[0] || null;
            var k = new Set;
            b && b.roles.forEach(function(a) {
                return k.add(a)
            });
            c && c.roles.forEach(function(a) {
                return k.add(a)
            });
            a = {
                id: a.id,
                active: !1,
                type: "variant",
                bandwidth: a.bandwidth,
                language: a.language,
                label: null,
                kind: h,
                width: null,
                height: null,
                frameRate: null,
                pixelAspectRatio: null,
                mimeType: g,
                codecs: f.join(", "),
                audioCodec: d,
                videoCodec: e,
                primary: a.primary,
                roles: Array.from(k),
                audioRoles: null,
                videoId: null,
                audioId: null,
                channelsCount: null,
                audioSamplingRate: null,
                audioBandwidth: null,
                videoBandwidth: null,
                originalVideoId: null,
                originalAudioId: null,
                originalTextId: null
            };
            c && (a.videoId = c.id, a.originalVideoId = c.originalId, a.width = c.width || null, a.height = c.height || null, a.frameRate = c.frameRate || null, a.pixelAspectRatio = c.pixelAspectRatio || null, a.videoBandwidth = c.bandwidth ||
                null);
            b && (a.audioId = b.id, a.originalAudioId = b.originalId, a.channelsCount = b.channelsCount, a.audioSamplingRate = b.audioSamplingRate, a.audioBandwidth = b.bandwidth || null, a.label = b.label, a.audioRoles = b.roles);
            return a
        };
        shaka.util.StreamUtils.textStreamToTrack = function(a) {
            return {
                id: a.id,
                active: !1,
                type: shaka.util.ManifestParserUtils.ContentType.TEXT,
                bandwidth: 0,
                language: a.language,
                label: a.label,
                kind: a.kind || null,
                width: null,
                height: null,
                frameRate: null,
                pixelAspectRatio: null,
                mimeType: a.mimeType,
                codecs: a.codecs || null,
                audioCodec: null,
                videoCodec: null,
                primary: a.primary,
                roles: a.roles,
                audioRoles: null,
                videoId: null,
                audioId: null,
                channelsCount: null,
                audioSamplingRate: null,
                audioBandwidth: null,
                videoBandwidth: null,
                originalVideoId: null,
                originalAudioId: null,
                originalTextId: a.originalId
            }
        };
        shaka.util.StreamUtils.html5TrackId = function(a) {
            a.__shaka_id || (a.__shaka_id = shaka.util.StreamUtils.nextTrackId_++);
            return a.__shaka_id
        };
        shaka.util.StreamUtils.nextTrackId_ = 0;
        shaka.util.StreamUtils.html5TextTrackToTrack = function(a) {
            var b = shaka.util.MimeUtils.CLOSED_CAPTION_MIMETYPE,
                c = shaka.util.StreamUtils.html5TrackToGenericShakaTrack_(a);
            c.active = "disabled" != a.mode;
            c.type = "text";
            c.originalTextId = a.id;
            "captions" == a.kind && (c.mimeType = b);
            a.kind && (c.roles = [a.kind]);
            return c
        };
        shaka.util.StreamUtils.html5AudioTrackToTrack = function(a) {
            var b = shaka.util.StreamUtils.html5TrackToGenericShakaTrack_(a);
            b.active = a.enabled;
            b.type = "variant";
            b.originalAudioId = a.id;
            "main" == a.kind && (b.primary = !0);
            a.kind && (b.roles = [a.kind], b.audioRoles = [a.kind]);
            return b
        };
        shaka.util.StreamUtils.html5TrackToGenericShakaTrack_ = function(a) {
            return {
                id: shaka.util.StreamUtils.html5TrackId(a),
                active: !1,
                type: "",
                bandwidth: 0,
                language: shaka.util.LanguageUtils.normalize(a.language),
                label: a.label,
                kind: a.kind,
                width: null,
                height: null,
                frameRate: null,
                pixelAspectRatio: null,
                mimeType: null,
                codecs: null,
                audioCodec: null,
                videoCodec: null,
                primary: !1,
                roles: [],
                audioRoles: null,
                videoId: null,
                audioId: null,
                channelsCount: null,
                audioSamplingRate: null,
                audioBandwidth: null,
                videoBandwidth: null,
                originalVideoId: null,
                originalAudioId: null,
                originalTextId: null
            }
        };
        shaka.util.StreamUtils.isPlayable = function(a) {
            return a.allowedByApplication && a.allowedByKeySystem
        };
        shaka.util.StreamUtils.getPlayableVariants = function(a) {
            return a.filter(function(a) {
                return shaka.util.StreamUtils.isPlayable(a)
            })
        };
        shaka.util.StreamUtils.filterVariantsByAudioChannelCount = function(a, b) {
            var c = a.filter(function(a) {
                    return a.audio && a.audio.channelsCount
                }),
                d = new Map;
            c = $jscomp.makeIterator(c);
            for (var e = c.next(); !e.done; e = c.next()) {
                e = e.value;
                var f = e.audio.channelsCount;
                goog.asserts.assert(null != f, "Must have count after filtering!");
                d.has(f) || d.set(f, []);
                d.get(f).push(e)
            }
            c = Array.from(d.keys());
            if (0 == c.length) return a;
            e = c.filter(function(a) {
                return a <= b
            });
            return e.length ? d.get(Math.max.apply(null, e)) : d.get(Math.min.apply(null,
                c))
        };
        shaka.util.StreamUtils.filterStreamsByLanguageAndRole = function(a, b, c) {
            var d = shaka.util.LanguageUtils,
                e = a,
                f = a.filter(function(a) {
                    return a.primary
                });
            f.length && (e = f);
            var g = e.length ? e[0].language : "";
            e = e.filter(function(a) {
                return a.language == g
            });
            if (b) {
                var h = d.findClosestLocale(d.normalize(b), a.map(function(a) {
                    return a.language
                }));
                h && (e = a.filter(function(a) {
                    return d.normalize(a.language) == h
                }))
            }
            if (c) {
                a = shaka.util.StreamUtils.filterTextStreamsByRole_(e, c);
                if (a.length) return a;
                shaka.log.warning("No exact match for the text role could be found.")
            } else if (a = e.filter(function(a) {
                    return 0 ==
                        a.roles.length
                }), a.length) return a;
            a = e.map(function(a) {
                return a.roles
            }).reduce(shaka.util.Functional.collapseArrays, []);
            return a.length ? shaka.util.StreamUtils.filterTextStreamsByRole_(e, a[0]) : e
        };
        shaka.util.StreamUtils.filterTextStreamsByRole_ = function(a, b) {
            return a.filter(function(a) {
                return a.roles.includes(b)
            })
        };
        shaka.util.StreamUtils.getVariantByStreams = function(a, b, c) {
            a && goog.asserts.assert(shaka.util.StreamUtils.isAudio(a), "Audio streams must have the audio type.");
            b && goog.asserts.assert(shaka.util.StreamUtils.isVideo(b), "Video streams must have the video type.");
            for (var d = 0; d < c.length; d++)
                if (c[d].audio == a && c[d].video == b) return c[d];
            return null
        };
        shaka.util.StreamUtils.isAudio = function(a) {
            return a.type == shaka.util.ManifestParserUtils.ContentType.AUDIO
        };
        shaka.util.StreamUtils.isVideo = function(a) {
            return a.type == shaka.util.ManifestParserUtils.ContentType.VIDEO
        };
        shaka.util.StreamUtils.getVariantStreams = function(a) {
            var b = [];
            a.audio && b.push(a.audio);
            a.video && b.push(a.video);
            return b
        };
        shaka.util.StreamUtils.getStreamSummaryString_ = function(a) {
            return shaka.util.StreamUtils.isAudio(a) ? "type=audio codecs=" + a.codecs + " bandwidth=" + a.bandwidth + " channelsCount=" + a.channelsCount + " audioSamplingRate=" + a.audioSamplingRate : shaka.util.StreamUtils.isVideo(a) ? "type=video codecs=" + a.codecs + " bandwidth=" + a.bandwidth + " frameRate=" + a.frameRate + " width=" + a.width + " height=" + a.height : "unexpected stream type"
        };
        shaka.abr.SimpleAbrManager = function() {
            this.switch_ = null;
            this.enabled_ = !1;
            this.bandwidthEstimator_ = new shaka.abr.EwmaBandwidthEstimator;
            this.variants_ = [];
            this.startupComplete_ = !1;
            this.config_ = this.lastTimeChosenMs_ = null
        };
        goog.exportSymbol("shaka.abr.SimpleAbrManager", shaka.abr.SimpleAbrManager);
        shaka.abr.SimpleAbrManager.prototype.stop = function() {
            this.switch_ = null;
            this.enabled_ = !1;
            this.variants_ = [];
            this.lastTimeChosenMs_ = null
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "stop", shaka.abr.SimpleAbrManager.prototype.stop);
        shaka.abr.SimpleAbrManager.prototype.init = function(a) {
            this.switch_ = a
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "init", shaka.abr.SimpleAbrManager.prototype.init);
        shaka.abr.SimpleAbrManager.prototype.chooseVariant = function() {
            var a = shaka.abr.SimpleAbrManager,
                b = a.filterAndSortVariants_(this.config_.restrictions, this.variants_),
                c = this.bandwidthEstimator_.getBandwidthEstimate(this.config_.defaultBandwidthEstimate);
            this.variants_.length && !b.length && (shaka.log.warning("No variants met the ABR restrictions. Choosing a variant by lowest bandwidth."), b = a.filterAndSortVariants_(null, this.variants_), b = [b[0]]);
            a = b[0] || null;
            for (var d = 0; d < b.length; ++d) {
                var e = b[d],
                    f = e.bandwidth /
                    this.config_.bandwidthDowngradeTarget,
                    g = (b[d + 1] || {
                        bandwidth: Infinity
                    }).bandwidth / this.config_.bandwidthUpgradeTarget;
                shaka.log.v2("Bandwidth ranges:", (e.bandwidth / 1E6).toFixed(3), (f / 1E6).toFixed(3), (g / 1E6).toFixed(3));
                c >= f && c <= g && (a = e)
            }
            this.lastTimeChosenMs_ = Date.now();
            return a
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "chooseVariant", shaka.abr.SimpleAbrManager.prototype.chooseVariant);
        shaka.abr.SimpleAbrManager.prototype.enable = function() {
            this.enabled_ = !0
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "enable", shaka.abr.SimpleAbrManager.prototype.enable);
        shaka.abr.SimpleAbrManager.prototype.disable = function() {
            this.enabled_ = !1
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "disable", shaka.abr.SimpleAbrManager.prototype.disable);
        shaka.abr.SimpleAbrManager.prototype.segmentDownloaded = function(a, b) {
            shaka.log.v2("Segment downloaded:", "deltaTimeMs=" + a, "numBytes=" + b, "lastTimeChosenMs=" + this.lastTimeChosenMs_, "enabled=" + this.enabled_);
            goog.asserts.assert(0 <= a, "expected a non-negative duration");
            this.bandwidthEstimator_.sample(a, b);
            null != this.lastTimeChosenMs_ && this.enabled_ && this.suggestStreams_()
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "segmentDownloaded", shaka.abr.SimpleAbrManager.prototype.segmentDownloaded);
        shaka.abr.SimpleAbrManager.prototype.getBandwidthEstimate = function() {
            return this.bandwidthEstimator_.getBandwidthEstimate(this.config_.defaultBandwidthEstimate)
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "getBandwidthEstimate", shaka.abr.SimpleAbrManager.prototype.getBandwidthEstimate);
        shaka.abr.SimpleAbrManager.prototype.setVariants = function(a) {
            this.variants_ = a
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "setVariants", shaka.abr.SimpleAbrManager.prototype.setVariants);
        shaka.abr.SimpleAbrManager.prototype.configure = function(a) {
            this.config_ = a
        };
        goog.exportProperty(shaka.abr.SimpleAbrManager.prototype, "configure", shaka.abr.SimpleAbrManager.prototype.configure);
        shaka.abr.SimpleAbrManager.prototype.suggestStreams_ = function() {
            shaka.log.v2("Suggesting Streams...");
            goog.asserts.assert(null != this.lastTimeChosenMs_, "lastTimeChosenMs_ should not be null");
            if (!this.startupComplete_) {
                if (!this.bandwidthEstimator_.hasGoodEstimate()) {
                    shaka.log.v2("Still waiting for a good estimate...");
                    return
                }
                this.startupComplete_ = !0
            } else if (Date.now() - this.lastTimeChosenMs_ < 1E3 * this.config_.switchInterval) {
                shaka.log.v2("Still within switch interval...");
                return
            }
            var a = this.chooseVariant(),
                b = this.bandwidthEstimator_.getBandwidthEstimate(this.config_.defaultBandwidthEstimate);
            shaka.log.debug("Calling switch_(), bandwidth=" + Math.round(b / 1E3) + " kbps");
            this.switch_(a)
        };
        shaka.abr.SimpleAbrManager.filterAndSortVariants_ = function(a, b) {
            a && (b = b.filter(function(b) {
                goog.asserts.assert(a, "Restrictions should exist!");
                return shaka.util.StreamUtils.meetsRestrictions(b, a, {
                    width: Infinity,
                    height: Infinity
                })
            }));
            return b.sort(function(a, b) {
                return a.bandwidth - b.bandwidth
            })
        };
        shaka.deprecate = {};
        shaka.deprecate.Version = function(a, b) {
            this.major_ = a;
            this.minor_ = b
        };
        shaka.deprecate.Version.prototype.major = function() {
            return this.major_
        };
        shaka.deprecate.Version.prototype.minor = function() {
            return this.minor_
        };
        shaka.deprecate.Version.prototype.compareTo = function(a) {
            var b = this.minor_ - a.minor_;
            return this.major_ - a.major_ || b
        };
        shaka.deprecate.Version.prototype.toString = function() {
            return "v" + this.major_ + "." + this.minor_
        };
        shaka.deprecate.Version.parse = function(a) {
            a = a.substring(1).split(".", 2);
            return new shaka.deprecate.Version(Number(a[0]), Number(a[1]))
        };
        shaka.deprecate.Enforcer = function(a, b, c) {
            this.libraryVersion_ = a;
            this.onPending_ = b;
            this.onExpired_ = c
        };
        shaka.deprecate.Enforcer.prototype.enforce = function(a, b, c) {
            (0 < a.compareTo(this.libraryVersion_) ? this.onPending_ : this.onExpired_)(this.libraryVersion_, a, b, c)
        };
        shaka.Deprecate = function() {};
        shaka.Deprecate.init = function(a) {
            goog.asserts.assert(null == shaka.Deprecate.enforcer_, "Deprecate.init should only be called once.");
            shaka.Deprecate.enforcer_ = new shaka.deprecate.Enforcer(shaka.deprecate.Version.parse(a), shaka.Deprecate.onPending_, shaka.Deprecate.onExpired_)
        };
        shaka.Deprecate.deprecateFeature = function(a, b, c, d) {
            var e = shaka.Deprecate.enforcer_;
            goog.asserts.assert(e, "Missing deprecation enforcer. Was |init| called?");
            a = new shaka.deprecate.Version(a, b);
            e.enforce(a, c, d)
        };
        shaka.Deprecate.onPending_ = function(a, b, c, d) {
            shaka.log.alwaysWarn([c, "has been deprecated and will be removed in", b, ". We are currently at version", a, ". Additional information:", d].join(" "))
        };
        shaka.Deprecate.onExpired_ = function(a, b, c, d) {
            a = [c, "has been deprecated and has been removed in", b, ". We are now at version", a, ". Additional information:", d].join("");
            shaka.log.alwaysError(a);
            goog.asserts.assert(!1, a)
        };
        shaka.Deprecate.enforcer_ = null;
        shaka.cast = {};
        shaka.cast.CastUtils = {};
        shaka.cast.CastUtils.VideoEvents = "ended play playing pause pausing ratechange seeked seeking timeupdate volumechange".split(" ");
        shaka.cast.CastUtils.VideoAttributes = "buffered currentTime duration ended loop muted paused playbackRate seeking videoHeight videoWidth volume".split(" ");
        shaka.cast.CastUtils.VideoInitStateAttributes = ["loop", "playbackRate"];
        shaka.cast.CastUtils.VideoVoidMethods = ["pause", "play"];
        shaka.cast.CastUtils.PlayerEvents = "abrstatuschanged adaptation buffering drmsessionupdate emsg error expirationupdated largegap loading manifestparsed onstatechange onstateidle streaming textchanged texttrackvisibility timelineregionadded timelineregionenter timelineregionexit trackschanged unloading variantchanged".split(" ");
        shaka.cast.CastUtils.PlayerGetterMethods = {
            getAssetUri: 2,
            getAudioLanguages: 2,
            getAudioLanguagesAndRoles: 2,
            getBufferedInfo: 2,
            getConfiguration: 2,
            getExpiration: 2,
            getPlaybackRate: 2,
            getTextLanguages: 2,
            getTextLanguagesAndRoles: 2,
            getTextTracks: 2,
            getStats: 5,
            getVariantTracks: 2,
            isAudioOnly: 10,
            isBuffering: 1,
            isInProgress: 1,
            isLive: 10,
            isTextTrackVisible: 1,
            keySystem: 10,
            seekRange: 1,
            usingEmbeddedTextTrack: 2,
            getLoadMode: 10
        };
        shaka.cast.CastUtils.PlayerGetterMethodsThatRequireLive = {
            getPlayheadTimeAsDate: 1,
            getPresentationStartTimeAsDate: 20
        };
        shaka.cast.CastUtils.PlayerInitState = [
            ["getConfiguration", "configure"]
        ];
        shaka.cast.CastUtils.PlayerInitAfterLoadState = [
            ["isTextTrackVisible", "setTextTrackVisibility"]
        ];
        shaka.cast.CastUtils.PlayerVoidMethods = "addTextTrack cancelTrickPlay configure resetConfiguration retryStreaming selectAudioLanguage selectEmbeddedTextTrack selectTextLanguage selectTextTrack selectVariantTrack selectVariantsByLabel setTextTrackVisibility trickPlay".split(" ");
        shaka.cast.CastUtils.PlayerPromiseMethods = ["attach", "detach", "load", "unload"];
        shaka.cast.CastUtils.SHAKA_MESSAGE_NAMESPACE = "urn:x-cast:com.google.shaka.v2";
        shaka.cast.CastUtils.GENERIC_MESSAGE_NAMESPACE = "urn:x-cast:com.google.cast.media";
        shaka.cast.CastUtils.serialize = function(a) {
            return JSON.stringify(a, function(a, c) {
                if ("function" != typeof c) {
                    if (c instanceof Event || c instanceof shaka.util.FakeEvent) {
                        var b = {},
                            e;
                        for (e in c) {
                            var f = c[e];
                            f && "object" == typeof f ? "detail" == e && (b[e] = f) : e in Event || (b[e] = f)
                        }
                        return b
                    }
                    return c instanceof Error ? shaka.cast.CastUtils.unpackError_(c) : c instanceof TimeRanges ? shaka.cast.CastUtils.unpackTimeRanges_(c) : c instanceof Uint8Array ? shaka.cast.CastUtils.unpackUint8Array_(c) : "number" == typeof c ? isNaN(c) ? "NaN" :
                        isFinite(c) ? c : 0 > c ? "-Infinity" : "Infinity" : c
                }
            })
        };
        shaka.cast.CastUtils.deserialize = function(a) {
            return JSON.parse(a, function(a, c) {
                return "NaN" == c ? NaN : "-Infinity" == c ? -Infinity : "Infinity" == c ? Infinity : c && "object" == typeof c && "TimeRanges" == c.__type__ ? shaka.cast.CastUtils.simulateTimeRanges_(c) : c && "object" == typeof c && "Uint8Array" == c.__type__ ? shaka.cast.CastUtils.makeUint8Array_(c) : c && "object" == typeof c && "Error" == c.__type__ ? shaka.cast.CastUtils.makeError_(c) : c
            })
        };
        shaka.cast.CastUtils.unpackTimeRanges_ = function(a) {
            for (var b = {
                    __type__: "TimeRanges",
                    length: a.length,
                    start: [],
                    end: []
                }, c = 0; c < a.length; ++c) b.start.push(a.start(c)), b.end.push(a.end(c));
            return b
        };
        shaka.cast.CastUtils.simulateTimeRanges_ = function(a) {
            return {
                length: a.length,
                start: function(b) {
                    return a.start[b]
                },
                end: function(b) {
                    return a.end[b]
                }
            }
        };
        shaka.cast.CastUtils.unpackUint8Array_ = function(a) {
            return {
                __type__: "Uint8Array",
                entries: Array.from(a)
            }
        };
        shaka.cast.CastUtils.makeUint8Array_ = function(a) {
            return new Uint8Array(a.entries)
        };
        shaka.cast.CastUtils.unpackError_ = function(a) {
            var b = new Set(["name", "message", "stack"]),
                c;
            for (c in a) b.add(c);
            var d = $jscomp.makeIterator(Object.getOwnPropertyNames(a));
            for (c = d.next(); !c.done; c = d.next()) b.add(c.value);
            d = {};
            b = $jscomp.makeIterator(b);
            for (c = b.next(); !c.done; c = b.next()) c = c.value, d[c] = a[c];
            return {
                __type__: "Error",
                contents: d
            }
        };
        shaka.cast.CastUtils.makeError_ = function(a) {
            a = a.contents;
            var b = Error(a.message),
                c;
            for (c in a) b[c] = a[c];
            return b
        };
        shaka.cast.CastSender = function(a, b, c, d, e, f) {
            this.receiverAppId_ = a;
            this.statusChangeTimer_ = new shaka.util.Timer(b);
            this.onFirstCastStateUpdate_ = c;
            this.hasJoinedExistingSession_ = !1;
            this.onRemoteEvent_ = d;
            this.onResumeLocal_ = e;
            this.onInitStateRequired_ = f;
            this.isCasting_ = this.apiReady_ = !1;
            this.receiverName_ = "";
            this.appData_ = null;
            this.onConnectionStatusChangedBound_ = this.onConnectionStatusChanged_.bind(this);
            this.onMessageReceivedBound_ = this.onMessageReceived_.bind(this);
            this.cachedProperties_ = {
                video: {},
                player: {}
            };
            this.nextAsyncCallId_ = 0;
            this.asyncCallPromises_ = {};
            this.castPromise_ = null;
            shaka.cast.CastSender.instances_.add(this)
        };
        shaka.cast.CastSender.hasReceivers_ = !1;
        shaka.cast.CastSender.session_ = null;
        shaka.cast.CastSender.prototype.destroy = function() {
            shaka.cast.CastSender.instances_["delete"](this);
            this.rejectAllPromises_();
            shaka.cast.CastSender.session_ && this.removeListeners_();
            this.statusChangeTimer_ && (this.statusChangeTimer_.stop(), this.statusChangeTimer_ = null);
            this.onResumeLocal_ = this.onRemoteEvent_ = null;
            this.isCasting_ = this.apiReady_ = !1;
            this.onMessageReceivedBound_ = this.onConnectionStatusChangedBound_ = this.castPromise_ = this.asyncCallPromises_ = this.cachedProperties_ = this.appData_ = null;
            return Promise.resolve()
        };
        shaka.cast.CastSender.prototype.apiReady = function() {
            return this.apiReady_
        };
        shaka.cast.CastSender.prototype.hasReceivers = function() {
            return shaka.cast.CastSender.hasReceivers_
        };
        shaka.cast.CastSender.prototype.isCasting = function() {
            return this.isCasting_
        };
        shaka.cast.CastSender.prototype.receiverName = function() {
            return this.receiverName_
        };
        shaka.cast.CastSender.prototype.hasRemoteProperties = function() {
            return 0 != Object.keys(this.cachedProperties_.video).length
        };
        shaka.cast.CastSender.prototype.init = function() {
            var a = shaka.cast.CastSender;
            if (window.chrome && chrome.cast && chrome.cast.isAvailable && this.receiverAppId_.length) {
                this.apiReady_ = !0;
                this.statusChangeTimer_.tickNow();
                var b = new chrome.cast.SessionRequest(this.receiverAppId_);
                a = new chrome.cast.ApiConfig(b, a.onExistingSessionJoined_.bind(this), a.onReceiverStatusChanged_.bind(this), "origin_scoped");
                chrome.cast.initialize(a, function() {
                    shaka.log.debug("CastSender: init")
                }, function(a) {
                    shaka.log.error("CastSender: init error",
                        a)
                });
                shaka.cast.CastSender.hasReceivers_ && this.statusChangeTimer_.tickAfter(.02);
                (a = shaka.cast.CastSender.session_) && a.status != chrome.cast.SessionStatus.STOPPED ? (shaka.log.debug("CastSender: re-using existing connection"), this.onExistingSessionJoined_(a)) : shaka.cast.CastSender.session_ = null
            }
        };
        shaka.cast.CastSender.prototype.setAppData = function(a) {
            this.appData_ = a;
            this.isCasting_ && this.sendMessage_({
                type: "appData",
                appData: this.appData_
            })
        };
        shaka.cast.CastSender.prototype.cast = function(a) {
            if (!this.apiReady_) return Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.CAST, shaka.util.Error.Code.CAST_API_UNAVAILABLE));
            if (!shaka.cast.CastSender.hasReceivers_) return Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.CAST, shaka.util.Error.Code.NO_CAST_RECEIVERS));
            if (this.isCasting_) return Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE,
                shaka.util.Error.Category.CAST, shaka.util.Error.Code.ALREADY_CASTING));
            this.castPromise_ = new shaka.util.PublicPromise;
            chrome.cast.requestSession(this.onSessionInitiated_.bind(this, a), this.onConnectionError_.bind(this));
            return this.castPromise_
        };
        shaka.cast.CastSender.prototype.showDisconnectDialog = function() {
            if (this.isCasting_) {
                var a = this.onInitStateRequired_();
                chrome.cast.requestSession(this.onSessionInitiated_.bind(this, a), this.onConnectionError_.bind(this))
            }
        };
        shaka.cast.CastSender.prototype.forceDisconnect = function() {
            if (this.isCasting_) {
                this.rejectAllPromises_();
                if (shaka.cast.CastSender.session_) {
                    this.removeListeners_();
                    try {
                        shaka.cast.CastSender.session_.stop(function() {}, function() {})
                    } catch (a) {}
                    shaka.cast.CastSender.session_ = null
                }
                this.onConnectionStatusChanged_()
            }
        };
        shaka.cast.CastSender.prototype.get = function(a, b) {
            goog.asserts.assert("video" == a || "player" == a, "Unexpected target name");
            var c = shaka.cast.CastUtils;
            if ("video" == a) {
                if (c.VideoVoidMethods.includes(b)) return this.remoteCall_.bind(this, a, b)
            } else if ("player" == a) {
                if (c.PlayerGetterMethodsThatRequireLive[b]) {
                    var d = this.get("player", "isLive")();
                    goog.asserts.assert(d, b + " should be called on a live stream!");
                    if (!d) return function() {}
                }
                if (c.PlayerVoidMethods.includes(b)) return this.remoteCall_.bind(this, a, b);
                if (c.PlayerPromiseMethods.includes(b)) return this.remoteAsyncCall_.bind(this,
                    a, b);
                if (c.PlayerGetterMethods[b]) return this.propertyGetter_.bind(this, a, b)
            }
            return this.propertyGetter_(a, b)
        };
        shaka.cast.CastSender.prototype.set = function(a, b, c) {
            goog.asserts.assert("video" == a || "player" == a, "Unexpected target name");
            this.cachedProperties_[a][b] = c;
            this.sendMessage_({
                type: "set",
                targetName: a,
                property: b,
                value: c
            })
        };
        shaka.cast.CastSender.prototype.onSessionInitiated_ = function(a, b) {
            shaka.log.debug("CastSender: onSessionInitiated");
            this.onSessionCreated_(b);
            this.sendMessage_({
                type: "init",
                initState: a,
                appData: this.appData_
            });
            this.castPromise_.resolve()
        };
        shaka.cast.CastSender.prototype.onConnectionError_ = function(a) {
            var b = shaka.util.Error.Code.UNEXPECTED_CAST_ERROR;
            switch (a.code) {
                case "cancel":
                    b = shaka.util.Error.Code.CAST_CANCELED_BY_USER;
                    break;
                case "timeout":
                    b = shaka.util.Error.Code.CAST_CONNECTION_TIMED_OUT;
                    break;
                case "receiver_unavailable":
                    b = shaka.util.Error.Code.CAST_RECEIVER_APP_UNAVAILABLE
            }
            this.castPromise_.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.CAST, b, a))
        };
        shaka.cast.CastSender.prototype.propertyGetter_ = function(a, b) {
            goog.asserts.assert("video" == a || "player" == a, "Unexpected target name");
            return this.cachedProperties_[a][b]
        };
        shaka.cast.CastSender.prototype.remoteCall_ = function(a, b, c) {
            for (var d = [], e = 2; e < arguments.length; ++e) d[e - 2] = arguments[e];
            goog.asserts.assert("video" == a || "player" == a, "Unexpected target name");
            this.sendMessage_({
                type: "call",
                targetName: a,
                methodName: b,
                args: d
            })
        };
        shaka.cast.CastSender.prototype.remoteAsyncCall_ = function(a, b, c) {
            for (var d = [], e = 2; e < arguments.length; ++e) d[e - 2] = arguments[e];
            goog.asserts.assert("video" == a || "player" == a, "Unexpected target name");
            e = new shaka.util.PublicPromise;
            var f = this.nextAsyncCallId_.toString();
            this.nextAsyncCallId_++;
            this.asyncCallPromises_[f] = e;
            try {
                this.sendMessage_({
                    type: "asyncCall",
                    targetName: a,
                    methodName: b,
                    args: d,
                    id: f
                })
            } catch (g) {
                e.reject(g)
            }
            return e
        };
        shaka.cast.CastSender.onExistingSessionJoined_ = function(a) {
            for (var b = $jscomp.makeIterator(shaka.cast.CastSender.instances_), c = b.next(); !c.done; c = b.next()) c.value.onExistingSessionJoined_(a)
        };
        shaka.cast.CastSender.prototype.onExistingSessionJoined_ = function(a) {
            shaka.log.debug("CastSender: onExistingSessionJoined");
            var b = this.onInitStateRequired_();
            this.castPromise_ = new shaka.util.PublicPromise;
            this.hasJoinedExistingSession_ = !0;
            this.onSessionInitiated_(b, a)
        };
        shaka.cast.CastSender.onReceiverStatusChanged_ = function(a) {
            for (var b = $jscomp.makeIterator(shaka.cast.CastSender.instances_), c = b.next(); !c.done; c = b.next()) c.value.onReceiverStatusChanged_(a)
        };
        shaka.cast.CastSender.prototype.onReceiverStatusChanged_ = function(a) {
            shaka.log.debug("CastSender: receiver status", a);
            shaka.cast.CastSender.hasReceivers_ = "available" == a;
            this.statusChangeTimer_.tickNow()
        };
        shaka.cast.CastSender.prototype.onSessionCreated_ = function(a) {
            shaka.cast.CastSender.session_ = a;
            a.addUpdateListener(this.onConnectionStatusChangedBound_);
            a.addMessageListener(shaka.cast.CastUtils.SHAKA_MESSAGE_NAMESPACE, this.onMessageReceivedBound_);
            this.onConnectionStatusChanged_()
        };
        shaka.cast.CastSender.prototype.removeListeners_ = function() {
            var a = shaka.cast.CastSender.session_;
            a.removeUpdateListener(this.onConnectionStatusChangedBound_);
            a.removeMessageListener(shaka.cast.CastUtils.SHAKA_MESSAGE_NAMESPACE, this.onMessageReceivedBound_)
        };
        shaka.cast.CastSender.prototype.onConnectionStatusChanged_ = function() {
            var a = shaka.cast.CastSender.session_ ? "connected" == shaka.cast.CastSender.session_.status : !1;
            shaka.log.debug("CastSender: connection status", a);
            if (this.isCasting_ && !a) {
                this.onResumeLocal_();
                for (var b in this.cachedProperties_) this.cachedProperties_[b] = {};
                this.rejectAllPromises_()
            }
            this.receiverName_ = (this.isCasting_ = a) ? shaka.cast.CastSender.session_.receiver.friendlyName : "";
            this.statusChangeTimer_.tickNow()
        };
        shaka.cast.CastSender.prototype.rejectAllPromises_ = function() {
            for (var a in this.asyncCallPromises_) {
                var b = this.asyncCallPromises_[a];
                delete this.asyncCallPromises_[a];
                b.reject(new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.LOAD_INTERRUPTED))
            }
        };
        shaka.cast.CastSender.prototype.onMessageReceived_ = function(a, b) {
            var c = shaka.cast.CastUtils.deserialize(b);
            shaka.log.v2("CastSender: message", c);
            switch (c.type) {
                case "event":
                    var d = c.targetName;
                    c = c.event;
                    c = new shaka.util.FakeEvent(c.type, c);
                    this.onRemoteEvent_(d, c);
                    break;
                case "update":
                    d = c.update;
                    for (var e in d) {
                        c = this.cachedProperties_[e] || {};
                        for (var f in d[e]) c[f] = d[e][f]
                    }
                    this.hasJoinedExistingSession_ && (this.onFirstCastStateUpdate_(), this.hasJoinedExistingSession_ = !1);
                    break;
                case "asyncComplete":
                    if (e =
                        c.id, c = c.error, f = this.asyncCallPromises_[e], delete this.asyncCallPromises_[e], goog.asserts.assert(f, "Unexpected async id"), f)
                        if (c) {
                            e = new shaka.util.Error(c.severity, c.category, c.code);
                            for (d in c) e[d] = c[d];
                            f.reject(e)
                        } else f.resolve()
            }
        };
        shaka.cast.CastSender.prototype.sendMessage_ = function(a) {
            a = shaka.cast.CastUtils.serialize(a);
            var b = shaka.cast.CastSender.session_;
            try {
                b.sendMessage(shaka.cast.CastUtils.SHAKA_MESSAGE_NAMESPACE, a, function() {}, shaka.log.error)
            } catch (c) {
                throw shaka.log.error("Cast session sendMessage threw", c), a = new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.CAST, shaka.util.Error.Code.CAST_CONNECTION_TIMED_OUT, c), b = new shaka.util.FakeEvent("error", {
                    detail: a
                }), this.onRemoteEvent_("player",
                    b), this.forceDisconnect(), a;
            }
        };
        shaka.cast.CastSender.instances_ = new Set;
        shaka.cast.CastSender.onSdkLoaded_ = function(a) {
            if (a) {
                a = $jscomp.makeIterator(shaka.cast.CastSender.instances_);
                for (var b = a.next(); !b.done; b = a.next()) b.value.init()
            }
        };
        window.__onGCastApiAvailable = shaka.cast.CastSender.onSdkLoaded_;
        shaka.cast.CastProxy = function(a, b, c) {
            var d = this;
            shaka.util.FakeEventTarget.call(this);
            this.localVideo_ = a;
            this.localPlayer_ = b;
            this.eventManager_ = this.playerEventTarget_ = this.videoEventTarget_ = this.playerProxy_ = this.videoProxy_ = null;
            this.receiverAppId_ = c;
            this.compiledToExternNames_ = new Map;
            this.sender_ = new shaka.cast.CastSender(c, function() {
                    return d.onCastStatusChanged_()
                }, function() {
                    return d.onFirstCastStateUpdate_()
                }, function(a, b) {
                    return d.onRemoteEvent_(a, b)
                }, function() {
                    return d.onResumeLocal_()
                },
                function() {
                    return d.getInitState_()
                });
            this.init_()
        };
        goog.inherits(shaka.cast.CastProxy, shaka.util.FakeEventTarget);
        goog.exportSymbol("shaka.cast.CastProxy", shaka.cast.CastProxy);
        shaka.cast.CastProxy.prototype.destroy = function(a) {
            a && this.sender_.forceDisconnect();
            this.eventManager_ && (this.eventManager_.release(), this.eventManager_ = null);
            a = [];
            this.localPlayer_ && (a.push(this.localPlayer_.destroy()), this.localPlayer_ = null);
            this.sender_ && (a.push(this.sender_.destroy()), this.sender_ = null);
            this.playerProxy_ = this.videoProxy_ = this.localVideo_ = null;
            return Promise.all(a)
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "destroy", shaka.cast.CastProxy.prototype.destroy);
        shaka.cast.CastProxy.prototype.getVideo = function() {
            return this.videoProxy_
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "getVideo", shaka.cast.CastProxy.prototype.getVideo);
        shaka.cast.CastProxy.prototype.getPlayer = function() {
            return this.playerProxy_
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "getPlayer", shaka.cast.CastProxy.prototype.getPlayer);
        shaka.cast.CastProxy.prototype.canCast = function() {
            return this.sender_.apiReady() && this.sender_.hasReceivers()
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "canCast", shaka.cast.CastProxy.prototype.canCast);
        shaka.cast.CastProxy.prototype.isCasting = function() {
            return this.sender_.isCasting()
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "isCasting", shaka.cast.CastProxy.prototype.isCasting);
        shaka.cast.CastProxy.prototype.receiverName = function() {
            return this.sender_.receiverName()
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "receiverName", shaka.cast.CastProxy.prototype.receiverName);
        shaka.cast.CastProxy.prototype.cast = function() {
            var a = this.getInitState_();
            return this.sender_.cast(a).then(function() {
                if (this.localPlayer_) return this.localPlayer_.unload()
            }.bind(this))
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "cast", shaka.cast.CastProxy.prototype.cast);
        shaka.cast.CastProxy.prototype.setAppData = function(a) {
            this.sender_.setAppData(a)
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "setAppData", shaka.cast.CastProxy.prototype.setAppData);
        shaka.cast.CastProxy.prototype.suggestDisconnect = function() {
            this.sender_.showDisconnectDialog()
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "suggestDisconnect", shaka.cast.CastProxy.prototype.suggestDisconnect);
        shaka.cast.CastProxy.prototype.changeReceiverId = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            if (a == b.receiverAppId_) return d["return"]();
                            b.receiverAppId_ = a;
                            b.sender_.forceDisconnect();
                            return d.yield(b.sender_.destroy(), 2);
                        case 2:
                            b.sender_ = null, b.sender_ = new shaka.cast.CastSender(a, function() {
                                return b.onCastStatusChanged_()
                            }, function() {
                                return b.onFirstCastStateUpdate_()
                            }, function(a,
                                d) {
                                return b.onRemoteEvent_(a, d)
                            }, function() {
                                return b.onResumeLocal_()
                            }, function() {
                                return b.getInitState_()
                            }), b.sender_.init(), d.jumpToEnd()
                    }
                })
            })
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "changeReceiverId", shaka.cast.CastProxy.prototype.changeReceiverId);
        shaka.cast.CastProxy.prototype.forceDisconnect = function() {
            this.sender_.forceDisconnect()
        };
        goog.exportProperty(shaka.cast.CastProxy.prototype, "forceDisconnect", shaka.cast.CastProxy.prototype.forceDisconnect);
        shaka.cast.CastProxy.prototype.init_ = function() {
            var a = this;
            this.sender_.init();
            this.eventManager_ = new shaka.util.EventManager;
            shaka.cast.CastUtils.VideoEvents.forEach(function(a) {
                this.eventManager_.listen(this.localVideo_, a, this.videoProxyLocalEvent_.bind(this))
            }.bind(this));
            shaka.cast.CastUtils.PlayerEvents.forEach(function(a) {
                this.eventManager_.listen(this.localPlayer_, a, this.playerProxyLocalEvent_.bind(this))
            }.bind(this));
            this.videoProxy_ = {};
            for (var b in this.localVideo_) Object.defineProperty(this.videoProxy_,
                b, {
                    configurable: !1,
                    enumerable: !0,
                    get: this.videoProxyGet_.bind(this, b),
                    set: this.videoProxySet_.bind(this, b)
                });
            this.playerProxy_ = {};
            this.iterateOverPlayerMethods_(function(b, d) {
                goog.asserts.assert(a.playerProxy_, "Must have player proxy!");
                Object.defineProperty(a.playerProxy_, b, {
                    configurable: !1,
                    enumerable: !0,
                    get: function() {
                        return a.playerProxyGet_(b)
                    }
                })
            });
            COMPILED && this.mapCompiledToUncompiledPlayerMethodNames_();
            this.videoEventTarget_ = new shaka.util.FakeEventTarget;
            this.videoEventTarget_.dispatchTarget =
                this.videoProxy_;
            this.playerEventTarget_ = new shaka.util.FakeEventTarget;
            this.playerEventTarget_.dispatchTarget = this.playerProxy_
        };
        shaka.cast.CastProxy.prototype.mapCompiledToUncompiledPlayerMethodNames_ = function() {
            var a = this,
                b = new Map;
            this.iterateOverPlayerMethods_(function(c, d) {
                if (b.has(d)) {
                    var e = b.get(d);
                    c.length < e.length ? a.compiledToExternNames_.set(c, e) : a.compiledToExternNames_.set(e, c)
                } else b.set(d, c)
            })
        };
        shaka.cast.CastProxy.prototype.iterateOverPlayerMethods_ = function(a) {
            function b(a) {
                return "constructor" == a || "function" != typeof c[a] ? !1 : !d.has(a)
            }
            goog.asserts.assert(this.localPlayer_, "Must have player!");
            var c = this.localPlayer_,
                d = new Set;
            for (e in c) b(e) && (d.add(e), a(e, c[e]));
            var e = Object.getPrototypeOf(c);
            for (var f = Object.getPrototypeOf({}); e && e != f;) {
                for (var g = $jscomp.makeIterator(Object.getOwnPropertyNames(e)), h = g.next(); !h.done; h = g.next()) h = h.value, b(h) && (d.add(h), a(h, c[h]));
                e = Object.getPrototypeOf(e)
            }
        };
        shaka.cast.CastProxy.prototype.getInitState_ = function() {
            var a = {
                video: {},
                player: {},
                playerAfterLoad: {},
                manifest: this.localPlayer_.getAssetUri(),
                startTime: null
            };
            this.localVideo_.pause();
            shaka.cast.CastUtils.VideoInitStateAttributes.forEach(function(b) {
                a.video[b] = this.localVideo_[b]
            }.bind(this));
            this.localVideo_.ended || (a.startTime = this.localVideo_.currentTime);
            shaka.cast.CastUtils.PlayerInitState.forEach(function(b) {
                var c = b[1];
                b = this.localPlayer_[b[0]]();
                a.player[c] = b
            }.bind(this));
            shaka.cast.CastUtils.PlayerInitAfterLoadState.forEach(function(b) {
                var c =
                    b[1];
                b = this.localPlayer_[b[0]]();
                a.playerAfterLoad[c] = b
            }.bind(this));
            return a
        };
        shaka.cast.CastProxy.prototype.onCastStatusChanged_ = function() {
            var a = new shaka.util.FakeEvent("caststatuschanged");
            this.dispatchEvent(a)
        };
        shaka.cast.CastProxy.prototype.onFirstCastStateUpdate_ = function() {
            var a = new shaka.util.FakeEvent(this.videoProxy_.paused ? "pause" : "play");
            this.videoEventTarget_.dispatchEvent(a)
        };
        shaka.cast.CastProxy.prototype.onResumeLocal_ = function() {
            var a = this;
            shaka.cast.CastUtils.PlayerInitState.forEach(function(a) {
                var b = a[1];
                a = this.sender_.get("player", a[0])();
                this.localPlayer_[b](a)
            }.bind(this));
            var b = this.sender_.get("player", "getAssetUri")(),
                c = this.sender_.get("video", "ended"),
                d = Promise.resolve(),
                e = this.localVideo_.autoplay,
                f = null;
            c || (f = this.sender_.get("video", "currentTime"));
            b && (this.localVideo_.autoplay = !1, d = this.localPlayer_.load(b, f));
            var g = {};
            shaka.cast.CastUtils.VideoInitStateAttributes.forEach(function(a) {
                g[a] =
                    this.sender_.get("video", a)
            }.bind(this));
            d.then(function() {
                a.localVideo_ && (shaka.cast.CastUtils.VideoInitStateAttributes.forEach(function(a) {
                    this.localVideo_[a] = g[a]
                }.bind(a)), shaka.cast.CastUtils.PlayerInitAfterLoadState.forEach(function(a) {
                    var b = a[1];
                    a = this.sender_.get("player", a[0])();
                    this.localPlayer_[b](a)
                }.bind(a)), a.localVideo_.autoplay = e, b && a.localVideo_.play())
            }, function(b) {
                goog.asserts.assert(b instanceof shaka.util.Error, "Wrong error type!");
                b = new shaka.util.FakeEvent("error", {
                    detail: b
                });
                a.localPlayer_.dispatchEvent(b)
            })
        };
        shaka.cast.CastProxy.prototype.videoProxyGet_ = function(a) {
            if ("addEventListener" == a) return this.videoEventTarget_.addEventListener.bind(this.videoEventTarget_);
            if ("removeEventListener" == a) return this.videoEventTarget_.removeEventListener.bind(this.videoEventTarget_);
            if (this.sender_.isCasting() && !this.sender_.hasRemoteProperties()) {
                var b = this.localVideo_[a];
                if ("function" != typeof b) return b
            }
            return this.sender_.isCasting() ? this.sender_.get("video", a) : (a = this.localVideo_[a], "function" == typeof a && (a = a.bind(this.localVideo_)),
                a)
        };
        shaka.cast.CastProxy.prototype.videoProxySet_ = function(a, b) {
            this.sender_.isCasting() ? this.sender_.set("video", a, b) : this.localVideo_[a] = b
        };
        shaka.cast.CastProxy.prototype.videoProxyLocalEvent_ = function(a) {
            this.sender_.isCasting() || (a = new shaka.util.FakeEvent(a.type, a), this.videoEventTarget_.dispatchEvent(a))
        };
        shaka.cast.CastProxy.prototype.playerProxyGet_ = function(a) {
            this.compiledToExternNames_.has(a) && (a = this.compiledToExternNames_.get(a));
            if ("addEventListener" == a) return this.playerEventTarget_.addEventListener.bind(this.playerEventTarget_);
            if ("removeEventListener" == a) return this.playerEventTarget_.removeEventListener.bind(this.playerEventTarget_);
            if ("getMediaElement" == a) return function() {
                return this.videoProxy_
            }.bind(this);
            if ("getSharedConfiguration" == a) return shaka.log.warning("Can't share configuration across a network. Returning copy."),
                this.sender_.get("player", "getConfiguration");
            if ("getNetworkingEngine" == a) return this.sender_.isCasting() && shaka.log.warning("NOTE: getNetworkingEngine() is always local!"), this.localPlayer_.getNetworkingEngine.bind(this.localPlayer_);
            if (this.sender_.isCasting()) {
                if ("getManifest" == a || "drmInfo" == a) return function() {
                    shaka.log.alwaysWarn(a + "() does not work while casting!");
                    return null
                };
                if ("getManifestUri" == a) return shaka.Deprecate.deprecateFeature(2, 6, "getManifestUri", 'Please use "getAssetUri" instead.'),
                    this.playerProxyGet_("getAssetUri");
                if ("attach" == a || "detach" == a) return function() {
                    shaka.log.alwaysWarn(a + "() does not work while casting!");
                    return Promise.resolve()
                }
            }
            if (this.sender_.isCasting() && !this.sender_.hasRemoteProperties() && shaka.cast.CastUtils.PlayerGetterMethods[a]) {
                var b = this.localPlayer_[a];
                goog.asserts.assert("function" == typeof b, "only methods on Player");
                return b.bind(this.localPlayer_)
            }
            return this.sender_.isCasting() ? this.sender_.get("player", a) : (b = this.localPlayer_[a], goog.asserts.assert("function" ==
                typeof b, "only methods on Player"), b.bind(this.localPlayer_))
        };
        shaka.cast.CastProxy.prototype.playerProxyLocalEvent_ = function(a) {
            this.sender_.isCasting() || this.playerEventTarget_.dispatchEvent(a)
        };
        shaka.cast.CastProxy.prototype.onRemoteEvent_ = function(a, b) {
            goog.asserts.assert(this.sender_.isCasting(), "Should only receive remote events while casting");
            this.sender_.isCasting() && ("video" == a ? this.videoEventTarget_.dispatchEvent(b) : "player" == a && this.playerEventTarget_.dispatchEvent(b))
        };
        shaka.cast.CastReceiver = function(a, b, c, d) {
            var e = this;
            shaka.util.FakeEventTarget.call(this);
            this.video_ = a;
            this.player_ = b;
            this.eventManager_ = new shaka.util.EventManager;
            this.targets_ = {
                video: a,
                player: b
            };
            this.appDataCallback_ = c || function() {};
            this.contentIdCallback_ = d || function(a) {
                return a
            };
            this.isConnected_ = !1;
            this.isIdle_ = !0;
            this.updateNumber_ = 0;
            this.startUpdatingUpdateNumber_ = !1;
            this.initialStatusUpdatePending_ = !0;
            this.genericBus_ = this.shakaBus_ = null;
            this.pollTimer_ = new shaka.util.Timer(function() {
                e.pollAttributes_()
            });
            this.init_()
        };
        goog.inherits(shaka.cast.CastReceiver, shaka.util.FakeEventTarget);
        goog.exportSymbol("shaka.cast.CastReceiver", shaka.cast.CastReceiver);
        shaka.cast.CastReceiver.prototype.isConnected = function() {
            return this.isConnected_
        };
        goog.exportProperty(shaka.cast.CastReceiver.prototype, "isConnected", shaka.cast.CastReceiver.prototype.isConnected);
        shaka.cast.CastReceiver.prototype.isIdle = function() {
            return this.isIdle_
        };
        goog.exportProperty(shaka.cast.CastReceiver.prototype, "isIdle", shaka.cast.CastReceiver.prototype.isIdle);
        shaka.cast.CastReceiver.prototype.destroy = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return a.eventManager_ && (a.eventManager_.release(), a.eventManager_ = null), d = [], a.player_ && (d.push(a.player_.destroy()), a.player_ = null), a.pollTimer_ && (a.pollTimer_.stop(), a.pollTimer_ = null), a.video_ = null, a.targets_ = null, a.appDataCallback_ = null, a.isConnected_ = !1, a.isIdle_ = !0, a.shakaBus_ =
                                null, a.genericBus_ = null, c.yield(Promise.all(d), 2);
                        case 2:
                            e = cast.receiver.CastReceiverManager.getInstance(), e.stop(), c.jumpToEnd()
                    }
                })
            })
        };
        goog.exportProperty(shaka.cast.CastReceiver.prototype, "destroy", shaka.cast.CastReceiver.prototype.destroy);
        shaka.cast.CastReceiver.prototype.init_ = function() {
            var a = cast.receiver.CastReceiverManager.getInstance();
            a.onSenderConnected = this.onSendersChanged_.bind(this);
            a.onSenderDisconnected = this.onSendersChanged_.bind(this);
            a.onSystemVolumeChanged = this.fakeVolumeChangeEvent_.bind(this);
            this.genericBus_ = a.getCastMessageBus(shaka.cast.CastUtils.GENERIC_MESSAGE_NAMESPACE);
            this.genericBus_.onMessage = this.onGenericMessage_.bind(this);
            this.shakaBus_ = a.getCastMessageBus(shaka.cast.CastUtils.SHAKA_MESSAGE_NAMESPACE);
            this.shakaBus_.onMessage = this.onShakaMessage_.bind(this);
            goog.DEBUG ? shaka.util.Platform.isChromecast() && a.start() : a.start();
            shaka.cast.CastUtils.VideoEvents.forEach(function(a) {
                this.eventManager_.listen(this.video_, a, this.proxyEvent_.bind(this, "video"))
            }.bind(this));
            shaka.cast.CastUtils.PlayerEvents.forEach(function(a) {
                this.eventManager_.listen(this.player_, a, this.proxyEvent_.bind(this, "player"))
            }.bind(this));
            cast.__platform__ && cast.__platform__.canDisplayType('video/mp4; codecs="avc1.640028"; width=3840; height=2160') ?
                this.player_.setMaxHardwareResolution(3840, 2160) : this.player_.setMaxHardwareResolution(1920, 1080);
            this.eventManager_.listen(this.video_, "loadeddata", function() {
                this.startUpdatingUpdateNumber_ = !0
            }.bind(this));
            this.eventManager_.listen(this.player_, "loading", function() {
                this.isIdle_ = !1;
                this.onCastStatusChanged_()
            }.bind(this));
            this.eventManager_.listen(this.video_, "playing", function() {
                this.isIdle_ = !1;
                this.onCastStatusChanged_()
            }.bind(this));
            this.eventManager_.listen(this.video_, "pause", function() {
                this.onCastStatusChanged_()
            }.bind(this));
            this.eventManager_.listen(this.player_, "unloading", function() {
                this.isIdle_ = !0;
                this.onCastStatusChanged_()
            }.bind(this));
            this.eventManager_.listen(this.video_, "ended", function() {
                var a = this;
                (new shaka.util.Timer(function() {
                    a.video_ && a.video_.ended && (a.isIdle_ = !0, a.onCastStatusChanged_())
                })).tickAfter(5)
            }.bind(this))
        };
        shaka.cast.CastReceiver.prototype.onSendersChanged_ = function() {
            this.updateNumber_ = 0;
            this.initialStatusUpdatePending_ = !0;
            this.isConnected_ = 0 != cast.receiver.CastReceiverManager.getInstance().getSenders().length;
            this.onCastStatusChanged_()
        };
        shaka.cast.CastReceiver.prototype.onCastStatusChanged_ = function() {
            Promise.resolve().then(function() {
                if (this.player_) {
                    var a = new shaka.util.FakeEvent("caststatuschanged");
                    this.dispatchEvent(a);
                    this.maybeSendMediaInfoMessage_() || this.sendMediaStatus_()
                }
            }.bind(this))
        };
        shaka.cast.CastReceiver.prototype.initState_ = function(a, b) {
            var c = this;
            for (d in a.player) this.player_[d](a.player[d]);
            this.appDataCallback_(b);
            var d = Promise.resolve();
            var e = this.video_.autoplay;
            a.manifest && (this.video_.autoplay = !1, d = this.player_.load(a.manifest, a.startTime));
            d.then(function() {
                if (c.player_) {
                    for (var b in a.video) c.video_[b] = a.video[b];
                    for (var d in a.playerAfterLoad) c.player_[d](a.playerAfterLoad[d]);
                    c.video_.autoplay = e;
                    a.manifest && (c.video_.play(), c.sendMediaStatus_())
                }
            }, function(a) {
                goog.asserts.assert(a instanceof shaka.util.Error, "Wrong error type!");
                a = new shaka.util.FakeEvent("error", {
                    detail: a
                });
                c.player_.dispatchEvent(a)
            })
        };
        shaka.cast.CastReceiver.prototype.proxyEvent_ = function(a, b) {
            this.player_ && (this.pollAttributes_(), this.sendMessage_({
                type: "event",
                targetName: a,
                event: b
            }, this.shakaBus_))
        };
        shaka.cast.CastReceiver.prototype.pollAttributes_ = function() {
            this.pollTimer_.tickAfter(.5);
            var a = {
                video: {},
                player: {}
            };
            shaka.cast.CastUtils.VideoAttributes.forEach(function(b) {
                a.video[b] = this.video_[b]
            }.bind(this));
            if (this.player_.isLive())
                for (var b in shaka.cast.CastUtils.PlayerGetterMethodsThatRequireLive) 0 == this.updateNumber_ % shaka.cast.CastUtils.PlayerGetterMethodsThatRequireLive[b] && (a.player[b] = this.player_[b]());
            for (var c in shaka.cast.CastUtils.PlayerGetterMethods) 0 == this.updateNumber_ % shaka.cast.CastUtils.PlayerGetterMethods[c] &&
                (a.player[c] = this.player_[c]());
            if (b = cast.receiver.CastReceiverManager.getInstance().getSystemVolume()) a.video.volume = b.level, a.video.muted = b.muted;
            this.startUpdatingUpdateNumber_ && (this.updateNumber_ += 1);
            this.sendMessage_({
                type: "update",
                update: a
            }, this.shakaBus_);
            this.maybeSendMediaInfoMessage_()
        };
        shaka.cast.CastReceiver.prototype.maybeSendMediaInfoMessage_ = function() {
            return this.initialStatusUpdatePending_ && (this.video_.duration || this.player_.isLive()) ? (this.sendMediaInfoMessage_(), this.initialStatusUpdatePending_ = !1, !0) : !1
        };
        shaka.cast.CastReceiver.prototype.sendMediaInfoMessage_ = function(a) {
            a = void 0 === a ? 0 : a;
            var b = {
                contentId: this.player_.getAssetUri(),
                streamType: this.player_.isLive() ? "LIVE" : "BUFFERED",
                contentType: ""
            };
            this.player_.isLive() || (b.duration = this.video_.duration);
            this.sendMediaStatus_(a, b)
        };
        shaka.cast.CastReceiver.prototype.fakeVolumeChangeEvent_ = function() {
            var a = cast.receiver.CastReceiverManager.getInstance().getSystemVolume();
            goog.asserts.assert(a, "System volume should not be null!");
            a && this.sendMessage_({
                type: "update",
                update: {
                    video: {
                        volume: a.level,
                        muted: a.muted
                    }
                }
            }, this.shakaBus_);
            this.sendMessage_({
                type: "event",
                targetName: "video",
                event: {
                    type: "volumechange"
                }
            }, this.shakaBus_)
        };
        shaka.cast.CastReceiver.prototype.onShakaMessage_ = function(a) {
            var b = shaka.cast.CastUtils.deserialize(a.data);
            shaka.log.debug("CastReceiver: message", b);
            switch (b.type) {
                case "init":
                    this.updateNumber_ = 0;
                    this.startUpdatingUpdateNumber_ = !1;
                    this.initialStatusUpdatePending_ = !0;
                    this.initState_(b.initState, b.appData);
                    this.pollAttributes_();
                    break;
                case "appData":
                    this.appDataCallback_(b.appData);
                    break;
                case "set":
                    var c = b.targetName,
                        d = b.property;
                    b = b.value;
                    if ("video" == c) {
                        var e = cast.receiver.CastReceiverManager.getInstance();
                        if ("volume" == d) {
                            e.setSystemVolumeLevel(b);
                            break
                        } else if ("muted" == d) {
                            e.setSystemVolumeMuted(b);
                            break
                        }
                    }
                    this.targets_[c][d] = b;
                    break;
                case "call":
                    c = this.targets_[b.targetName];
                    c[b.methodName].apply(c, b.args);
                    break;
                case "asyncCall":
                    c = b.targetName;
                    d = b.methodName;
                    "player" == c && "load" == d && (this.updateNumber_ = 0, this.startUpdatingUpdateNumber_ = !1);
                    e = b.id;
                    a = a.senderId;
                    var f = this.targets_[c];
                    b = f[d].apply(f, b.args);
                    "player" == c && "load" == d && (b = b.then(function() {
                        this.initialStatusUpdatePending_ = !0
                    }.bind(this)));
                    b.then(this.sendAsyncComplete_.bind(this,
                        a, e, null), this.sendAsyncComplete_.bind(this, a, e))
            }
        };
        shaka.cast.CastReceiver.prototype.onGenericMessage_ = function(a) {
            var b = shaka.cast.CastUtils.deserialize(a.data);
            shaka.log.debug("CastReceiver: message", b);
            switch (b.type) {
                case "PLAY":
                    this.video_.play();
                    this.sendMediaStatus_();
                    break;
                case "PAUSE":
                    this.video_.pause();
                    this.sendMediaStatus_();
                    break;
                case "SEEK":
                    a = b.currentTime;
                    var c = b.resumeState;
                    null != a && (this.video_.currentTime = Number(a));
                    c && "PLAYBACK_START" == c ? (this.video_.play(), this.sendMediaStatus_()) : c && "PLAYBACK_PAUSE" == c && (this.video_.pause(), this.sendMediaStatus_());
                    break;
                case "STOP":
                    this.player_.unload().then(function() {
                        this.player_ && this.sendMediaStatus_()
                    }.bind(this));
                    break;
                case "GET_STATUS":
                    this.sendMediaInfoMessage_(Number(b.requestId));
                    break;
                case "VOLUME":
                    c = b.volume;
                    a = c.level;
                    c = c.muted;
                    var d = this.video_.volume,
                        e = this.video_.muted;
                    null != a && (this.video_.volume = Number(a));
                    null != c && (this.video_.muted = c);
                    d == this.video_.volume && e == this.video_.muted || this.sendMediaStatus_();
                    break;
                case "LOAD":
                    this.updateNumber_ = 0;
                    this.initialStatusUpdatePending_ = this.startUpdatingUpdateNumber_ = !1;
                    a = b.media;
                    c = b.currentTime;
                    d = this.contentIdCallback_(a.contentId);
                    e = b.autoplay || !0;
                    this.appDataCallback_(a.customData);
                    e && (this.video_.autoplay = !0);
                    this.player_.load(d, c).then(function() {
                        this.player_ && this.sendMediaInfoMessage_()
                    }.bind(this))["catch"](function(a) {
                        var c = "LOAD_FAILED";
                        a.category == shaka.util.Error.Category.PLAYER && a.code == shaka.util.Error.Code.LOAD_INTERRUPTED && (c = "LOAD_CANCELLED");
                        this.sendMessage_({
                            requestId: Number(b.requestId),
                            type: c
                        }, this.genericBus_)
                    }.bind(this));
                    break;
                default:
                    shaka.log.warning("Unrecognized message type from the generic Chromecast controller!",
                        b.type), this.sendMessage_({
                        requestId: Number(b.requestId),
                        type: "INVALID_REQUEST",
                        reason: "INVALID_COMMAND"
                    }, this.genericBus_)
            }
        };
        shaka.cast.CastReceiver.prototype.sendAsyncComplete_ = function(a, b, c) {
            this.player_ && this.sendMessage_({
                type: "asyncComplete",
                id: b,
                error: c
            }, this.shakaBus_, a)
        };
        shaka.cast.CastReceiver.prototype.sendMessage_ = function(a, b, c) {
            this.isConnected_ && (a = shaka.cast.CastUtils.serialize(a), c ? b.getCastChannel(c).send(a) : b.broadcast(a))
        };
        shaka.cast.CastReceiver.prototype.getPlayState_ = function() {
            var a = shaka.cast.CastReceiver.PLAY_STATE;
            return this.isIdle_ ? a.IDLE : this.player_.isBuffering() ? a.BUFFERING : this.video_.paused ? a.PAUSED : a.PLAYING
        };
        shaka.cast.CastReceiver.prototype.sendMediaStatus_ = function(a, b) {
            a = void 0 === a ? 0 : a;
            b = void 0 === b ? null : b;
            var c = {
                mediaSessionId: 0,
                playbackRate: this.video_.playbackRate,
                playerState: this.getPlayState_(),
                currentTime: this.video_.currentTime,
                supportedMediaCommands: 63,
                volume: {
                    level: this.video_.volume,
                    muted: this.video_.muted
                }
            };
            b && (c.media = b);
            this.sendMessage_({
                requestId: a,
                type: "MEDIA_STATUS",
                status: [c]
            }, this.genericBus_)
        };
        shaka.cast.CastReceiver.PLAY_STATE = {
            IDLE: "IDLE",
            PLAYING: "PLAYING",
            BUFFERING: "BUFFERING",
            PAUSED: "PAUSED"
        };
        shaka.util.DataViewReader = function(a, b) {
            this.dataView_ = a;
            this.littleEndian_ = b == shaka.util.DataViewReader.Endianness.LITTLE_ENDIAN;
            this.position_ = 0
        };
        goog.exportSymbol("shaka.util.DataViewReader", shaka.util.DataViewReader);
        shaka.util.DataViewReader.Endianness = {
            BIG_ENDIAN: 0,
            LITTLE_ENDIAN: 1
        };
        goog.exportProperty(shaka.util.DataViewReader, "Endianness", shaka.util.DataViewReader.Endianness);
        shaka.util.DataViewReader.prototype.getDataView = function() {
            return this.dataView_
        };
        shaka.util.DataViewReader.prototype.hasMoreData = function() {
            return this.position_ < this.dataView_.byteLength
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "hasMoreData", shaka.util.DataViewReader.prototype.hasMoreData);
        shaka.util.DataViewReader.prototype.getPosition = function() {
            return this.position_
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "getPosition", shaka.util.DataViewReader.prototype.getPosition);
        shaka.util.DataViewReader.prototype.getLength = function() {
            return this.dataView_.byteLength
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "getLength", shaka.util.DataViewReader.prototype.getLength);
        shaka.util.DataViewReader.prototype.readUint8 = function() {
            try {
                var a = this.dataView_.getUint8(this.position_);
                this.position_ += 1;
                return a
            } catch (b) {
                this.throwOutOfBounds_()
            }
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "readUint8", shaka.util.DataViewReader.prototype.readUint8);
        shaka.util.DataViewReader.prototype.readUint16 = function() {
            try {
                var a = this.dataView_.getUint16(this.position_, this.littleEndian_);
                this.position_ += 2;
                return a
            } catch (b) {
                this.throwOutOfBounds_()
            }
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "readUint16", shaka.util.DataViewReader.prototype.readUint16);
        shaka.util.DataViewReader.prototype.readUint32 = function() {
            try {
                var a = this.dataView_.getUint32(this.position_, this.littleEndian_);
                this.position_ += 4;
                return a
            } catch (b) {
                this.throwOutOfBounds_()
            }
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "readUint32", shaka.util.DataViewReader.prototype.readUint32);
        shaka.util.DataViewReader.prototype.readInt32 = function() {
            try {
                var a = this.dataView_.getInt32(this.position_, this.littleEndian_);
                this.position_ += 4;
                return a
            } catch (b) {
                this.throwOutOfBounds_()
            }
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "readInt32", shaka.util.DataViewReader.prototype.readInt32);
        shaka.util.DataViewReader.prototype.readUint64 = function() {
            try {
                if (this.littleEndian_) {
                    var a = this.dataView_.getUint32(this.position_, !0);
                    var b = this.dataView_.getUint32(this.position_ + 4, !0)
                } else b = this.dataView_.getUint32(this.position_, !1), a = this.dataView_.getUint32(this.position_ + 4, !1)
            } catch (c) {
                this.throwOutOfBounds_()
            }
            if (2097151 < b) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.JS_INTEGER_OVERFLOW);
            this.position_ += 8;
            return b * Math.pow(2,
                32) + a
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "readUint64", shaka.util.DataViewReader.prototype.readUint64);
        shaka.util.DataViewReader.prototype.readBytes = function(a) {
            goog.asserts.assert(0 <= a, "Bad call to DataViewReader.readBytes");
            this.position_ + a > this.dataView_.byteLength && this.throwOutOfBounds_();
            var b = new Uint8Array(this.dataView_.buffer, this.dataView_.byteOffset + this.position_, a);
            this.position_ += a;
            return b
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "readBytes", shaka.util.DataViewReader.prototype.readBytes);
        shaka.util.DataViewReader.prototype.skip = function(a) {
            goog.asserts.assert(0 <= a, "Bad call to DataViewReader.skip");
            this.position_ + a > this.dataView_.byteLength && this.throwOutOfBounds_();
            this.position_ += a
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "skip", shaka.util.DataViewReader.prototype.skip);
        shaka.util.DataViewReader.prototype.rewind = function(a) {
            goog.asserts.assert(0 <= a, "Bad call to DataViewReader.rewind");
            this.position_ < a && this.throwOutOfBounds_();
            this.position_ -= a
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "rewind", shaka.util.DataViewReader.prototype.rewind);
        shaka.util.DataViewReader.prototype.seek = function(a) {
            goog.asserts.assert(0 <= a, "Bad call to DataViewReader.seek");
            (0 > a || a > this.dataView_.byteLength) && this.throwOutOfBounds_();
            this.position_ = a
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "seek", shaka.util.DataViewReader.prototype.seek);
        shaka.util.DataViewReader.prototype.readTerminatedString = function() {
            for (var a = this.position_; this.hasMoreData() && 0 != this.dataView_.getUint8(this.position_);) this.position_ += 1;
            a = new Uint8Array(this.dataView_.buffer, this.dataView_.byteOffset + a, this.position_ - a);
            this.position_ += 1;
            return shaka.util.StringUtils.fromUTF8(a)
        };
        goog.exportProperty(shaka.util.DataViewReader.prototype, "readTerminatedString", shaka.util.DataViewReader.prototype.readTerminatedString);
        shaka.util.DataViewReader.prototype.throwOutOfBounds_ = function() {
            throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.BUFFER_READ_OUT_OF_BOUNDS);
        };
        shaka.util.Mp4Parser = function() {
            this.headers_ = [];
            this.boxDefinitions_ = [];
            this.done_ = !1
        };
        goog.exportSymbol("shaka.util.Mp4Parser", shaka.util.Mp4Parser);
        shaka.util.Mp4Parser.BoxType_ = {
            BASIC_BOX: 0,
            FULL_BOX: 1
        };
        shaka.util.Mp4Parser.prototype.box = function(a, b) {
            var c = shaka.util.Mp4Parser.typeFromString_(a);
            this.headers_[c] = shaka.util.Mp4Parser.BoxType_.BASIC_BOX;
            this.boxDefinitions_[c] = b;
            return this
        };
        goog.exportProperty(shaka.util.Mp4Parser.prototype, "box", shaka.util.Mp4Parser.prototype.box);
        shaka.util.Mp4Parser.prototype.fullBox = function(a, b) {
            var c = shaka.util.Mp4Parser.typeFromString_(a);
            this.headers_[c] = shaka.util.Mp4Parser.BoxType_.FULL_BOX;
            this.boxDefinitions_[c] = b;
            return this
        };
        goog.exportProperty(shaka.util.Mp4Parser.prototype, "fullBox", shaka.util.Mp4Parser.prototype.fullBox);
        shaka.util.Mp4Parser.prototype.stop = function() {
            this.done_ = !0
        };
        goog.exportProperty(shaka.util.Mp4Parser.prototype, "stop", shaka.util.Mp4Parser.prototype.stop);
        shaka.util.Mp4Parser.prototype.parse = function(a, b) {
            var c = new Uint8Array(a);
            c = new shaka.util.DataViewReader(new DataView(c.buffer, c.byteOffset, c.byteLength), shaka.util.DataViewReader.Endianness.BIG_ENDIAN);
            for (this.done_ = !1; c.hasMoreData() && !this.done_;) this.parseNext(0, c, b)
        };
        goog.exportProperty(shaka.util.Mp4Parser.prototype, "parse", shaka.util.Mp4Parser.prototype.parse);
        shaka.util.Mp4Parser.prototype.parseNext = function(a, b, c) {
            var d = b.getPosition(),
                e = b.readUint32(),
                f = b.readUint32(),
                g = shaka.util.Mp4Parser.typeToString(f);
            shaka.log.v2("Parsing MP4 box", g);
            switch (e) {
                case 0:
                    e = b.getLength() - d;
                    break;
                case 1:
                    e = b.readUint64()
            }
            if (g = this.boxDefinitions_[f]) {
                var h = null,
                    k = null;
                this.headers_[f] == shaka.util.Mp4Parser.BoxType_.FULL_BOX && (k = b.readUint32(), h = k >>> 24, k &= 16777215);
                f = d + e;
                c && f > b.getLength() && (f = b.getLength());
                f -= b.getPosition();
                b = 0 < f ? b.readBytes(f) : new Uint8Array(0);
                b =
                    new shaka.util.DataViewReader(new DataView(b.buffer, b.byteOffset, b.byteLength), shaka.util.DataViewReader.Endianness.BIG_ENDIAN);
                g({
                    parser: this,
                    partialOkay: c || !1,
                    version: h,
                    flags: k,
                    reader: b,
                    size: e,
                    start: d + a
                })
            } else a = Math.min(d + e - b.getPosition(), b.getLength() - b.getPosition()), b.skip(a)
        };
        goog.exportProperty(shaka.util.Mp4Parser.prototype, "parseNext", shaka.util.Mp4Parser.prototype.parseNext);
        shaka.util.Mp4Parser.children = function(a) {
            for (var b = null != a.flags ? 12 : 8; a.reader.hasMoreData() && !a.parser.done_;) a.parser.parseNext(a.start + b, a.reader, a.partialOkay)
        };
        goog.exportProperty(shaka.util.Mp4Parser, "children", shaka.util.Mp4Parser.children);
        shaka.util.Mp4Parser.sampleDescription = function(a) {
            for (var b = null != a.flags ? 12 : 8, c = a.reader.readUint32(); 0 < c && !a.parser.done_; --c) a.parser.parseNext(a.start + b, a.reader, a.partialOkay)
        };
        goog.exportProperty(shaka.util.Mp4Parser, "sampleDescription", shaka.util.Mp4Parser.sampleDescription);
        shaka.util.Mp4Parser.allData = function(a) {
            return function(b) {
                var c = b.reader.getLength() - b.reader.getPosition();
                a(b.reader.readBytes(c))
            }
        };
        goog.exportProperty(shaka.util.Mp4Parser, "allData", shaka.util.Mp4Parser.allData);
        shaka.util.Mp4Parser.typeFromString_ = function(a) {
            goog.asserts.assert(4 == a.length, "Mp4 box names must be 4 characters long");
            for (var b = 0, c = 0; c < a.length; c++) b = b << 8 | a.charCodeAt(c);
            return b
        };
        shaka.util.Mp4Parser.typeToString = function(a) {
            return String.fromCharCode(a >> 24 & 255, a >> 16 & 255, a >> 8 & 255, a & 255)
        };
        goog.exportProperty(shaka.util.Mp4Parser, "typeToString", shaka.util.Mp4Parser.typeToString);
        shaka.util.Pssh = function(a) {
            var b = this;
            this.systemIds = [];
            this.cencKeyIds = [];
            this.data = [];
            (new shaka.util.Mp4Parser).box("moov", shaka.util.Mp4Parser.children).fullBox("pssh", function(a) {
                return b.parsePsshBox_(a)
            }).parse(a);
            0 == this.data.length && shaka.log.warning("No pssh box found!")
        };
        shaka.util.Pssh.prototype.parsePsshBox_ = function(a) {
            goog.asserts.assert(null != a.version, "PSSH boxes are full boxes and must have a valid version");
            goog.asserts.assert(null != a.flags, "PSSH boxes are full boxes and must have a valid flag");
            if (1 < a.version) shaka.log.warning("Unrecognized PSSH version found!");
            else {
                var b = a.reader.getDataView();
                goog.asserts.assert(12 <= b.byteOffset, "DataView at incorrect position");
                b = new Uint8Array(b.buffer, b.byteOffset - 12, a.size);
                this.data.push(b);
                this.systemIds.push(shaka.util.Uint8ArrayUtils.toHex(a.reader.readBytes(16)));
                if (0 < a.version) {
                    b = a.reader.readUint32();
                    for (var c = 0; c < b; ++c) {
                        var d = shaka.util.Uint8ArrayUtils.toHex(a.reader.readBytes(16));
                        this.cencKeyIds.push(d)
                    }
                }
            }
        };
        shaka.util.Pssh.createPssh = function(a, b) {
            var c = a.length,
                d = 12 + b.length + 4 + c,
                e = new ArrayBuffer(d),
                f = new Uint8Array(e);
            e = new DataView(e);
            var g = 0;
            e.setUint32(g, d);
            g += 4;
            e.setUint32(g, 1886614376);
            g += 4;
            e.setUint32(g, 0);
            g += 4;
            f.set(b, g);
            g += b.length;
            e.setUint32(g, c);
            g += 4;
            f.set(a, g);
            goog.asserts.assert(g + c === d, "PSSH invalid length.");
            return f
        };
        shaka.util.Pssh.normaliseInitData = function(a) {
            if (!a) return a;
            var b = new shaka.util.Pssh(a);
            if (1 >= b.data.length) return a;
            a = [];
            var c = {};
            b = $jscomp.makeIterator(b.data);
            for (var d = b.next(); !d.done; c = {
                    initData$226: c.initData$226
                }, d = b.next()) c.initData$226 = d.value, a.some(function(a) {
                return function(b) {
                    return shaka.util.Uint8ArrayUtils.equal(b, a.initData$226)
                }
            }(c)) || a.push(c.initData$226);
            return shaka.util.Uint8ArrayUtils.concat.apply(shaka.util.Uint8ArrayUtils, $jscomp.arrayFromIterable(a))
        };
        shaka.util.XmlUtils = {};
        shaka.util.XmlUtils.findChild = function(a, b) {
            var c = shaka.util.XmlUtils.findChildren(a, b);
            return 1 != c.length ? null : c[0]
        };
        shaka.util.XmlUtils.findChildNS = function(a, b, c) {
            a = shaka.util.XmlUtils.findChildrenNS(a, b, c);
            return 1 != a.length ? null : a[0]
        };
        shaka.util.XmlUtils.findChildren = function(a, b) {
            return Array.prototype.filter.call(a.childNodes, function(a) {
                return a instanceof Element && a.tagName == b
            })
        };
        shaka.util.XmlUtils.findChildrenNS = function(a, b, c) {
            return Array.prototype.filter.call(a.childNodes, function(a) {
                return a instanceof Element && a.localName == c && a.namespaceURI == b
            })
        };
        shaka.util.XmlUtils.getAttributeNS = function(a, b, c) {
            return a.hasAttributeNS(b, c) ? a.getAttributeNS(b, c) : null
        };
        shaka.util.XmlUtils.getContents = function(a) {
            return Array.prototype.every.call(a.childNodes, function(a) {
                return a.nodeType == Node.TEXT_NODE || a.nodeType == Node.CDATA_SECTION_NODE
            }) ? a.textContent.trim() : null
        };
        shaka.util.XmlUtils.parseAttr = function(a, b, c, d) {
            d = void 0 === d ? null : d;
            var e = null;
            a = a.getAttribute(b);
            null != a && (e = c(a));
            return null == e ? d : e
        };
        shaka.util.XmlUtils.parseDate = function(a) {
            if (!a) return null;
            /^\d+-\d+-\d+T\d+:\d+:\d+(\.\d+)?$/.test(a) && (a += "Z");
            a = Date.parse(a);
            return isNaN(a) ? null : Math.floor(a / 1E3)
        };
        shaka.util.XmlUtils.parseDuration = function(a) {
            if (!a) return null;
            var b = /^P(?:([0-9]*)Y)?(?:([0-9]*)M)?(?:([0-9]*)D)?(?:T(?:([0-9]*)H)?(?:([0-9]*)M)?(?:([0-9.]*)S)?)?$/.exec(a);
            if (!b) return shaka.log.warning("Invalid duration string:", a), null;
            a = 31536E3 * Number(b[1] || null) + 2592E3 * Number(b[2] || null) + 86400 * Number(b[3] || null) + 3600 * Number(b[4] || null) + 60 * Number(b[5] || null) + Number(b[6] || null);
            return isFinite(a) ? a : null
        };
        shaka.util.XmlUtils.parseRange = function(a) {
            var b = /([0-9]+)-([0-9]+)/.exec(a);
            if (!b) return null;
            a = Number(b[1]);
            if (!isFinite(a)) return null;
            b = Number(b[2]);
            return isFinite(b) ? {
                start: a,
                end: b
            } : null
        };
        shaka.util.XmlUtils.parseInt = function(a) {
            a = Number(a);
            return 0 === a % 1 ? a : null
        };
        shaka.util.XmlUtils.parsePositiveInt = function(a) {
            a = Number(a);
            return 0 === a % 1 && 0 < a ? a : null
        };
        shaka.util.XmlUtils.parseNonNegativeInt = function(a) {
            a = Number(a);
            return 0 === a % 1 && 0 <= a ? a : null
        };
        shaka.util.XmlUtils.parseFloat = function(a) {
            a = Number(a);
            return isNaN(a) ? null : a
        };
        shaka.util.XmlUtils.evalDivision = function(a) {
            var b;
            a = (b = a.match(/^(\d+)\/(\d+)$/)) ? Number(b[1]) / Number(b[2]) : Number(a);
            return isNaN(a) ? null : a
        };
        shaka.util.XmlUtils.parseXmlString = function(a, b) {
            var c = new DOMParser;
            try {
                var d = c.parseFromString(a, "text/xml")
            } catch (f) {}
            if (d && d.documentElement.tagName == b) var e = d.documentElement;
            return e && 0 < e.getElementsByTagName("parsererror").length ? null : e
        };
        shaka.util.XmlUtils.parseXml = function(a, b) {
            try {
                var c = shaka.util.StringUtils.fromUTF8(a);
                return shaka.util.XmlUtils.parseXmlString(c, b)
            } catch (d) {}
        };
        shaka.dash = {};
        shaka.dash.ContentProtection = {};
        shaka.dash.ContentProtection.defaultKeySystems_ = (new Map).set("urn:uuid:1077efec-c0b2-4d02-ace3-3c1e52e2fb4b", "org.w3.clearkey").set("urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed", "com.widevine.alpha").set("urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95", "com.microsoft.playready").set("urn:uuid:79f0049a-4098-8642-ab92-e65be0885f95", "com.microsoft.playready").set("urn:uuid:f239e769-efa3-4850-9c16-a903c6932efb", "com.adobe.primetime");
        shaka.dash.ContentProtection.MP4Protection_ = "urn:mpeg:dash:mp4protection:2011";
        shaka.dash.ContentProtection.CencNamespaceUri_ = "urn:mpeg:cenc:2013";
        shaka.dash.ContentProtection.parseFromAdaptationSet = function(a, b, c) {
            var d = shaka.dash.ContentProtection,
                e = shaka.util.ManifestParserUtils,
                f = d.parseElements_(a),
                g = null;
            a = [];
            var h = [],
                k = new Set(f.map(function(a) {
                    return a.keyId
                }));
            k["delete"](null);
            if (1 < k.size) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_CONFLICTING_KEY_IDS);
            c || (h = f.filter(function(a) {
                return a.schemeUri == d.MP4Protection_ ? (goog.asserts.assert(!a.init || a.init.length,
                    "Init data must be null or non-empty."), g = a.init || g, !1) : !0
            }), h.length && (a = d.convertElements_(g, b, h), 0 == a.length && (a = [e.createDrmInfo("", g)])));
            if (f.length && (c || !h.length))
                for (a = [], b = $jscomp.makeIterator(d.defaultKeySystems_.values()), c = b.next(); !c.done; c = b.next()) c = c.value, "org.w3.clearkey" != c && (c = e.createDrmInfo(c, g), a.push(c));
            if (e = Array.from(k)[0] || null)
                for (k = $jscomp.makeIterator(a), b = k.next(); !b.done; b = k.next())
                    for (b = $jscomp.makeIterator(b.value.initData), c = b.next(); !c.done; c = b.next()) c.value.keyId =
                        e;
            return {
                defaultKeyId: e,
                defaultInit: g,
                drmInfos: a,
                firstRepresentation: !0
            }
        };
        shaka.dash.ContentProtection.parseFromRepresentation = function(a, b, c, d) {
            var e = shaka.dash.ContentProtection.parseFromAdaptationSet(a, b, d);
            if (c.firstRepresentation) {
                a = 1 == c.drmInfos.length && !c.drmInfos[0].keySystem;
                b = 0 == e.drmInfos.length;
                if (0 == c.drmInfos.length || a && !b) c.drmInfos = e.drmInfos;
                c.firstRepresentation = !1
            } else if (0 < e.drmInfos.length && (c.drmInfos = c.drmInfos.filter(function(a) {
                    return e.drmInfos.some(function(b) {
                        return b.keySystem == a.keySystem
                    })
                }), 0 == c.drmInfos.length)) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_NO_COMMON_KEY_SYSTEM);
            return e.defaultKeyId || c.defaultKeyId
        };
        shaka.dash.ContentProtection.getWidevineLicenseUrl = function(a) {
            return (a = shaka.util.XmlUtils.findChildNS(a.node, "urn:microsoft", "laurl")) ? a.getAttribute("licenseUrl") || "" : ""
        };
        shaka.dash.ContentProtection.PLAYREADY_RECORD_TYPES = {
            RIGHTS_MANAGEMENT: 1,
            RESERVED: 2,
            EMBEDDED_LICENSE: 3
        };
        shaka.dash.ContentProtection.parseMsProRecords_ = function(a, b) {
            for (var c = [], d = new DataView(a); b < a.byteLength - 1;) {
                var e = d.getUint16(b, !0);
                b += 2;
                var f = d.getUint16(b, !0);
                b += 2;
                goog.asserts.assert(0 === (f & 1), "expected byteLength to be an even number");
                var g = new Uint8Array(a, b, f);
                c.push({
                    type: e,
                    value: g
                });
                b += f
            }
            return c
        };
        shaka.dash.ContentProtection.parseMsPro_ = function(a) {
            var b = 0,
                c = (new DataView(a)).getUint32(b, !0);
            b += 4;
            return c !== a.byteLength ? (shaka.log.warning("PlayReady Object with invalid length encountered."), []) : shaka.dash.ContentProtection.parseMsProRecords_(a, b + 2)
        };
        shaka.dash.ContentProtection.getLaurl_ = function(a) {
            a = $jscomp.makeIterator(a.getElementsByTagName("DATA"));
            for (var b = a.next(); !b.done; b = a.next()) {
                b = $jscomp.makeIterator(b.value.childNodes);
                for (var c = b.next(); !c.done; c = b.next())
                    if (c = c.value, c instanceof Element && "LA_URL" == c.tagName) return c.textContent
            }
            return ""
        };
        shaka.dash.ContentProtection.getPlayReadyLicenseUrl = function(a) {
            var b = shaka.util.XmlUtils.findChildNS(a.node, "urn:microsoft:playready", "pro");
            if (!b) return "";
            a = shaka.dash.ContentProtection;
            var c = a.PLAYREADY_RECORD_TYPES;
            b = shaka.util.Uint8ArrayUtils.fromBase64(b.textContent);
            b = a.parseMsPro_(b.buffer).filter(function(a) {
                return a.type === c.RIGHTS_MANAGEMENT
            })[0];
            if (!b) return "";
            b = shaka.util.StringUtils.fromUTF16(b.value, !0);
            return (b = shaka.util.XmlUtils.parseXmlString(b, "WRMHEADER")) ? a.getLaurl_(b) : ""
        };
        shaka.dash.ContentProtection.getInitDataFromPro_ = function(a) {
            var b = shaka.util.XmlUtils.findChildNS(a.node, "urn:microsoft:playready", "pro");
            if (!b) return null;
            b = shaka.util.Uint8ArrayUtils.fromBase64(b.textContent);
            var c = new Uint8Array([154, 4, 240, 121, 152, 64, 66, 134, 171, 146, 230, 91, 224, 136, 95, 149]);
            return [{
                initData: shaka.util.Pssh.createPssh(b, c),
                initDataType: "cenc",
                keyId: a.keyId
            }]
        };
        shaka.dash.ContentProtection.convertElements_ = function(a, b, c) {
            var d = shaka.dash.ContentProtection,
                e = shaka.util.ManifestParserUtils,
                f = d.defaultKeySystems_,
                g = d.licenseUrlParsers_,
                h = [];
            c = $jscomp.makeIterator(c);
            for (var k = c.next(); !k.done; k = c.next()) {
                k = k.value;
                var l = f.get(k.schemeUri);
                if (l) {
                    goog.asserts.assert(!k.init || k.init.length, "Init data must be null or non-empty.");
                    var m = d.getInitDataFromPro_(k);
                    m = e.createDrmInfo(l, k.init || a || m);
                    if (l = g.get(l)) m.licenseServerUri = l(k);
                    h.push(m)
                } else
                    for (goog.asserts.assert(b,
                            "ContentProtection callback is required"), k = b(k.node) || [], k = $jscomp.makeIterator(k), l = k.next(); !l.done; l = k.next()) h.push(l.value)
            }
            return h
        };
        shaka.dash.ContentProtection.licenseUrlParsers_ = (new Map).set("com.widevine.alpha", shaka.dash.ContentProtection.getWidevineLicenseUrl).set("com.microsoft.playready", shaka.dash.ContentProtection.getPlayReadyLicenseUrl);
        shaka.dash.ContentProtection.parseElements_ = function(a) {
            var b = [];
            a = $jscomp.makeIterator(a);
            for (var c = a.next(); !c.done; c = a.next())(c = shaka.dash.ContentProtection.parseElement_(c.value)) && b.push(c);
            return b
        };
        shaka.dash.ContentProtection.parseElement_ = function(a) {
            var b = shaka.dash.ContentProtection.CencNamespaceUri_,
                c = a.getAttribute("schemeIdUri"),
                d = shaka.util.XmlUtils.getAttributeNS(a, b, "default_KID");
            b = shaka.util.XmlUtils.findChildrenNS(a, b, "pssh").map(shaka.util.XmlUtils.getContents);
            if (!c) return shaka.log.error("Missing required schemeIdUri attribute on", "ContentProtection element", a), null;
            c = c.toLowerCase();
            if (d && (d = d.replace(/-/g, "").toLowerCase(), d.includes(" "))) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_MULTIPLE_KEY_IDS_NOT_SUPPORTED);
            var e = [];
            try {
                e = b.map(function(a) {
                    return {
                        initDataType: "cenc",
                        initData: shaka.util.Uint8ArrayUtils.fromBase64(a),
                        keyId: null
                    }
                })
            } catch (f) {
                throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_PSSH_BAD_ENCODING);
            }
            return {
                node: a,
                schemeUri: c,
                keyId: d,
                init: 0 < e.length ? e : null
            }
        };
        shaka.dash.MpdUtils = {};
        shaka.dash.MpdUtils.XlinkNamespaceUri_ = "http://www.w3.org/1999/xlink";
        shaka.dash.MpdUtils.fillUriTemplate = function(a, b, c, d, e) {
            var f = {
                RepresentationID: b,
                Number: c,
                Bandwidth: d,
                Time: e
            };
            return a.replace(/\$(RepresentationID|Number|Bandwidth|Time)?(?:%0([0-9]+)([diouxX]))?\$/g, function(b, c, d, e) {
                if ("$$" == b) return "$";
                var g = f[c];
                goog.asserts.assert(void 0 !== g, "Unrecognized identifier");
                if (null == g) return shaka.log.warning("URL template does not have an available substitution for identifier", '"' + c + '":', a), b;
                "RepresentationID" == c && d && (shaka.log.warning("URL template should not contain a width specifier for identifier",
                    '"RepresentationID":', a), d = void 0);
                "Time" == c && (goog.asserts.assert(.2 > Math.abs(g - Math.round(g)), "Calculated $Time$ values must be close to integers"), g = Math.round(g));
                switch (e) {
                    case void 0:
                    case "d":
                    case "i":
                    case "u":
                        b = g.toString();
                        break;
                    case "o":
                        b = g.toString(8);
                        break;
                    case "x":
                        b = g.toString(16);
                        break;
                    case "X":
                        b = g.toString(16).toUpperCase();
                        break;
                    default:
                        goog.asserts.assert(!1, "Unhandled format specifier"), b = g.toString()
                }
                d = window.parseInt(d, 10) || 1;
                return Array(Math.max(0, d - b.length) + 1).join("0") + b
            })
        };
        shaka.dash.MpdUtils.createTimeline = function(a, b, c, d) {
            goog.asserts.assert(0 < b && Infinity > b, "timescale must be a positive, finite integer");
            goog.asserts.assert(0 < d, "period duration must be a positive integer");
            var e = shaka.util.XmlUtils;
            a = e.findChildren(a, "S");
            for (var f = [], g = -c, h = 0; h < a.length; ++h) {
                var k = a[h],
                    l = e.parseAttr(k, "t", e.parseNonNegativeInt),
                    m = e.parseAttr(k, "d", e.parseNonNegativeInt),
                    n = e.parseAttr(k, "r", e.parseInt);
                null != l && (l -= c);
                if (!m) {
                    shaka.log.warning('"S" element must have a duration:',
                        'ignoring the remaining "S" elements.', k);
                    break
                }
                l = null != l ? l : g;
                n = n || 0;
                if (0 > n)
                    if (h + 1 < a.length) {
                        n = e.parseAttr(a[h + 1], "t", e.parseNonNegativeInt);
                        if (null == n) {
                            shaka.log.warning('An "S" element cannot have a negative repeat', 'if the next "S" element does not have a valid start time:', 'ignoring the remaining "S" elements.', k);
                            break
                        } else if (l >= n) {
                            shaka.log.warning('An "S" element cannot have a negative repeat', 'if its start time exceeds the next "S" element\'s start time:', 'ignoring the remaining "S" elements.',
                                k);
                            break
                        }
                        n = Math.ceil((n - l) / m) - 1
                    } else {
                        if (Infinity == d) {
                            shaka.log.warning('The last "S" element cannot have a negative repeat', "if the Period has an infinite duration:", 'ignoring the last "S" element.', k);
                            break
                        } else if (l / b >= d) {
                            shaka.log.warning('The last "S" element cannot have a negative repeat', "if its start time exceeds the Period's duration:", 'igoring the last "S" element.', k);
                            break
                        }
                        n = Math.ceil((d * b - l) / m) - 1
                    } 0 < f.length && l != g && (Math.abs((l - g) / b) >= shaka.util.ManifestParserUtils.GAP_OVERLAP_TOLERANCE_SECONDS &&
                    shaka.log.warning("SegmentTimeline contains a large gap/overlap:", "the content may have errors in it.", k), f[f.length - 1].end = l / b);
                for (k = 0; k <= n; ++k) g = l + m, f.push({
                    start: l / b,
                    end: g / b,
                    unscaledStart: l
                }), l = g
            }
            return f
        };
        shaka.dash.MpdUtils.parseSegmentInfo = function(a, b) {
            goog.asserts.assert(b(a.representation), "There must be at least one element of the given type.");
            var c = shaka.dash.MpdUtils,
                d = shaka.util.XmlUtils,
                e = c.inheritAttribute(a, b, "timescale"),
                f = 1;
            e && (f = d.parsePositiveInt(e) || 1);
            e = c.inheritAttribute(a, b, "duration");
            (e = d.parsePositiveInt(e || "")) && (e /= f);
            var g = c.inheritAttribute(a, b, "startNumber"),
                h = Number(c.inheritAttribute(a, b, "presentationTimeOffset")) || 0;
            d = d.parseNonNegativeInt(g || "");
            if (null == g || null == d) d =
                1;
            g = c.inheritChild(a, b, "SegmentTimeline");
            var k = null;
            g && (k = c.createTimeline(g, f, h, a.periodInfo.duration || Infinity));
            return {
                timescale: f,
                segmentDuration: e,
                startNumber: d,
                scaledPresentationTimeOffset: h / f || 0,
                unscaledPresentationTimeOffset: h,
                timeline: k
            }
        };
        shaka.dash.MpdUtils.inheritAttribute = function(a, b, c) {
            var d = shaka.util.Functional;
            goog.asserts.assert(b(a.representation), "There must be at least one element of the given type");
            return [b(a.representation), b(a.adaptationSet), b(a.period)].filter(d.isNotNull).map(function(a) {
                return a.getAttribute(c)
            }).reduce(function(a, b) {
                return a || b
            })
        };
        shaka.dash.MpdUtils.inheritChild = function(a, b, c) {
            var d = shaka.util.Functional;
            goog.asserts.assert(b(a.representation), "There must be at least one element of the given type");
            a = [b(a.representation), b(a.adaptationSet), b(a.period)].filter(d.isNotNull);
            var e = shaka.util.XmlUtils;
            return a.map(function(a) {
                return e.findChild(a, c)
            }).reduce(function(a, b) {
                return a || b
            })
        };
        shaka.dash.MpdUtils.handleXlinkInElement_ = function(a, b, c, d, e, f) {
            var g = shaka.util.XmlUtils,
                h = shaka.util.Error,
                k = shaka.util.ManifestParserUtils,
                l = shaka.dash.MpdUtils.XlinkNamespaceUri_,
                m = g.getAttributeNS(a, l, "href");
            g = g.getAttributeNS(a, l, "actuate") || "onRequest";
            for (var n = 0; n < a.attributes.length; n++) {
                var q = a.attributes[n];
                q.namespaceURI == l && (a.removeAttributeNS(q.namespaceURI, q.localName), --n)
            }
            if (5 <= f) return shaka.util.AbortableOperation.failed(new h(h.Severity.CRITICAL, h.Category.MANIFEST, h.Code.DASH_XLINK_DEPTH_LIMIT));
            if ("onLoad" != g) return shaka.util.AbortableOperation.failed(new h(h.Severity.CRITICAL, h.Category.MANIFEST, h.Code.DASH_UNSUPPORTED_XLINK_ACTUATE));
            var p = k.resolveUris([d], [m]);
            d = shaka.net.NetworkingEngine.RequestType.MANIFEST;
            k = shaka.net.NetworkingEngine.makeRequest(p, b);
            d = e.request(d, k);
            goog.asserts.assert(d instanceof shaka.util.AbortableOperation, "Unexpected implementation of IAbortableOperation!");
            return d.chain(function(d) {
                d = shaka.util.XmlUtils.parseXml(d.data, a.tagName);
                if (!d) return shaka.util.AbortableOperation.failed(new h(h.Severity.CRITICAL,
                    h.Category.MANIFEST, h.Code.DASH_INVALID_XML, m));
                for (; a.childNodes.length;) a.removeChild(a.childNodes[0]);
                for (; d.childNodes.length;) {
                    var g = d.childNodes[0];
                    d.removeChild(g);
                    a.appendChild(g)
                }
                for (g = 0; g < d.attributes.length; g++) {
                    var k = d.attributes[g].nodeName,
                        l = d.getAttribute(k);
                    a.setAttribute(k, l)
                }
                return shaka.dash.MpdUtils.processXlinks(a, b, c, p[0], e, f + 1)
            })
        };
        shaka.dash.MpdUtils.processXlinks = function(a, b, c, d, e, f) {
            f = void 0 === f ? 0 : f;
            var g = shaka.dash.MpdUtils,
                h = shaka.util.XmlUtils,
                k = g.XlinkNamespaceUri_;
            if (h.getAttributeNS(a, k, "href")) return h = g.handleXlinkInElement_(a, b, c, d, e, f), c && (h = h.chain(void 0, function(h) {
                return g.processXlinks(a, b, c, d, e, f)
            })), h;
            for (var l = [], m = 0; m < a.childNodes.length; m++) {
                var n = a.childNodes[m];
                n instanceof Element && ("urn:mpeg:dash:resolve-to-zero:2013" == h.getAttributeNS(n, k, "href") ? (a.removeChild(n), --m) : "SegmentTimeline" != n.tagName &&
                    l.push(shaka.dash.MpdUtils.processXlinks(n, b, c, d, e, f)))
            }
            return shaka.util.AbortableOperation.all(l).chain(function() {
                return a
            })
        };
        shaka.media.InitSegmentReference = function(a, b, c) {
            this.getUris = a;
            this.startByte = b;
            this.endByte = c
        };
        goog.exportSymbol("shaka.media.InitSegmentReference", shaka.media.InitSegmentReference);
        shaka.media.InitSegmentReference.prototype.createUris = function() {
            return this.getUris()
        };
        goog.exportProperty(shaka.media.InitSegmentReference.prototype, "createUris", shaka.media.InitSegmentReference.prototype.createUris);
        shaka.media.InitSegmentReference.prototype.getStartByte = function() {
            return this.startByte
        };
        goog.exportProperty(shaka.media.InitSegmentReference.prototype, "getStartByte", shaka.media.InitSegmentReference.prototype.getStartByte);
        shaka.media.InitSegmentReference.prototype.getEndByte = function() {
            return this.endByte
        };
        goog.exportProperty(shaka.media.InitSegmentReference.prototype, "getEndByte", shaka.media.InitSegmentReference.prototype.getEndByte);
        shaka.media.InitSegmentReference.prototype.getSize = function() {
            return this.endByte ? this.endByte - this.startByte : null
        };
        shaka.media.SegmentReference = function(a, b, c, d, e, f) {
            goog.asserts.assert(b < c, "startTime must be less than endTime");
            goog.asserts.assert(e < f || null == f, "startByte must be < endByte");
            this.position = a;
            this.startTime = b;
            this.endTime = c;
            this.getUris = d;
            this.startByte = e;
            this.endByte = f
        };
        goog.exportSymbol("shaka.media.SegmentReference", shaka.media.SegmentReference);
        shaka.media.SegmentReference.prototype.getPosition = function() {
            return this.position
        };
        goog.exportProperty(shaka.media.SegmentReference.prototype, "getPosition", shaka.media.SegmentReference.prototype.getPosition);
        shaka.media.SegmentReference.prototype.getStartTime = function() {
            return this.startTime
        };
        goog.exportProperty(shaka.media.SegmentReference.prototype, "getStartTime", shaka.media.SegmentReference.prototype.getStartTime);
        shaka.media.SegmentReference.prototype.getEndTime = function() {
            return this.endTime
        };
        goog.exportProperty(shaka.media.SegmentReference.prototype, "getEndTime", shaka.media.SegmentReference.prototype.getEndTime);
        shaka.media.SegmentReference.prototype.createUris = function() {
            return this.getUris()
        };
        goog.exportProperty(shaka.media.SegmentReference.prototype, "createUris", shaka.media.SegmentReference.prototype.createUris);
        shaka.media.SegmentReference.prototype.getStartByte = function() {
            return this.startByte
        };
        goog.exportProperty(shaka.media.SegmentReference.prototype, "getStartByte", shaka.media.SegmentReference.prototype.getStartByte);
        shaka.media.SegmentReference.prototype.getEndByte = function() {
            return this.endByte
        };
        goog.exportProperty(shaka.media.SegmentReference.prototype, "getEndByte", shaka.media.SegmentReference.prototype.getEndByte);
        shaka.media.SegmentReference.prototype.getSize = function() {
            return this.endByte ? this.endByte - this.startByte : null
        };
        shaka.media.Mp4SegmentIndexParser = function(a, b, c, d) {
            var e = shaka.media.Mp4SegmentIndexParser,
                f, g = (new shaka.util.Mp4Parser).fullBox("sidx", function(a) {
                    f = e.parseSIDX_(b, d, c, a)
                });
            a && g.parse(a);
            if (f) return f;
            shaka.log.error('Invalid box type, expected "sidx".');
            throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.MP4_SIDX_WRONG_BOX_TYPE);
        };
        shaka.media.Mp4SegmentIndexParser.parseSIDX_ = function(a, b, c, d) {
            goog.asserts.assert(null != d.version, "SIDX is a full box and should have a valid version.");
            var e = [];
            d.reader.skip(4);
            var f = d.reader.readUint32();
            if (0 == f) throw shaka.log.error("Invalid timescale."), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.MP4_SIDX_INVALID_TIMESCALE);
            if (0 == d.version) {
                var g = d.reader.readUint32();
                var h = d.reader.readUint32()
            } else g = d.reader.readUint64(), h =
                d.reader.readUint64();
            d.reader.skip(2);
            var k = d.reader.readUint16();
            a = a + d.size + h;
            for (h = 0; h < k; h++) {
                var l = d.reader.readUint32(),
                    m = (l & 2147483648) >>> 31;
                l &= 2147483647;
                var n = d.reader.readUint32();
                d.reader.skip(4);
                if (1 == m) throw shaka.log.error("Heirarchical SIDXs are not supported."), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.MP4_SIDX_TYPE_NOT_SUPPORTED);
                e.push(new shaka.media.SegmentReference(e.length, g / f - b, (g + n) / f - b, function() {
                        return c
                    },
                    a, a + l - 1));
                g += n;
                a += l
            }
            d.parser.stop();
            return e
        };
        shaka.media.SegmentIndex = function(a) {
            goog.DEBUG && shaka.media.SegmentIndex.assertCorrectReferences_(a);
            this.references_ = a
        };
        goog.exportSymbol("shaka.media.SegmentIndex", shaka.media.SegmentIndex);
        shaka.media.SegmentIndex.prototype.destroy = function() {
            this.references_ = null;
            return Promise.resolve()
        };
        goog.exportProperty(shaka.media.SegmentIndex.prototype, "destroy", shaka.media.SegmentIndex.prototype.destroy);
        shaka.media.SegmentIndex.prototype.find = function(a) {
            for (var b = this.references_.length - 1; 0 <= b; --b) {
                var c = this.references_[b];
                if (a >= c.startTime && a < c.endTime) return c.position
            }
            return this.references_.length && a < this.references_[0].startTime ? this.references_[0].position : null
        };
        goog.exportProperty(shaka.media.SegmentIndex.prototype, "find", shaka.media.SegmentIndex.prototype.find);
        shaka.media.SegmentIndex.prototype.get = function(a) {
            if (0 == this.references_.length) return null;
            a -= this.references_[0].position;
            return 0 > a || a >= this.references_.length ? null : this.references_[a]
        };
        goog.exportProperty(shaka.media.SegmentIndex.prototype, "get", shaka.media.SegmentIndex.prototype.get);
        shaka.media.SegmentIndex.prototype.offset = function(a) {
            for (var b = 0; b < this.references_.length; ++b) this.references_[b].startTime += a, this.references_[b].endTime += a
        };
        goog.exportProperty(shaka.media.SegmentIndex.prototype, "offset", shaka.media.SegmentIndex.prototype.offset);
        shaka.media.SegmentIndex.prototype.merge = function(a) {
            goog.DEBUG && shaka.media.SegmentIndex.assertCorrectReferences_(a);
            for (var b = [], c = 0, d = 0; c < this.references_.length && d < a.length;) {
                var e = this.references_[c],
                    f = a[d];
                e.startTime < f.startTime ? (b.push(e), c++) : (e.startTime > f.startTime ? 0 == c ? b.push(f) : shaka.log.warning("Refusing to rewrite original references on update!") : (.1 < Math.abs(e.endTime - f.endTime) ? (goog.asserts.assert(f.endTime > e.endTime && c == this.references_.length - 1 && d == a.length - 1, "This should be an update of the last segment in a period"),
                    e = new shaka.media.SegmentReference(e.position, f.startTime, f.endTime, f.getUris, f.startByte, f.endByte), b.push(e)) : b.push(e), c++), d++)
            }
            for (; c < this.references_.length;) b.push(this.references_[c++]);
            if (b.length)
                for (c = b[b.length - 1].position + 1; d < a.length;) e = a[d++], e = new shaka.media.SegmentReference(c++, e.startTime, e.endTime, e.getUris, e.startByte, e.endByte), b.push(e);
            else b = a;
            goog.DEBUG && shaka.media.SegmentIndex.assertCorrectReferences_(b);
            this.references_ = b
        };
        goog.exportProperty(shaka.media.SegmentIndex.prototype, "merge", shaka.media.SegmentIndex.prototype.merge);
        shaka.media.SegmentIndex.prototype.replace = function(a) {
            goog.DEBUG && shaka.media.SegmentIndex.assertCorrectReferences_(a);
            this.references_ = a
        };
        shaka.media.SegmentIndex.prototype.evict = function(a) {
            for (var b = 0; b < this.references_.length; ++b)
                if (this.references_[b].endTime > a) {
                    this.references_.splice(0, b);
                    return
                } this.references_ = []
        };
        goog.exportProperty(shaka.media.SegmentIndex.prototype, "evict", shaka.media.SegmentIndex.prototype.evict);
        shaka.media.SegmentIndex.prototype.fit = function(a) {
            goog.asserts.assert(null != a, "Period duration must be known for static content!");
            for (goog.asserts.assert(Infinity != a, "Period duration must be finite for static content!"); this.references_.length;)
                if (this.references_[this.references_.length - 1].startTime >= a) this.references_.pop();
                else break;
            for (; this.references_.length;)
                if (0 >= this.references_[0].endTime) this.references_.shift();
                else break;
            if (0 != this.references_.length) {
                var b = this.references_[this.references_.length -
                    1];
                this.references_[this.references_.length - 1] = new shaka.media.SegmentReference(b.position, b.startTime, a, b.getUris, b.startByte, b.endByte)
            }
        };
        goog.DEBUG && (shaka.media.SegmentIndex.assertCorrectReferences_ = function(a) {
            goog.asserts.assert(a.every(function(b, c) {
                if (0 == c) return !0;
                var d = a[c - 1];
                return b.position != d.position + 1 ? !1 : d.startTime < b.startTime ? !0 : d.startTime > b.startTime ? !1 : d.endTime <= b.endTime ? !0 : !1
            }), "SegmentReferences are incorrect")
        });
        shaka.util.EbmlParser = function(a) {
            this.dataView_ = a;
            this.reader_ = new shaka.util.DataViewReader(a, shaka.util.DataViewReader.Endianness.BIG_ENDIAN);
            shaka.util.EbmlParser.DYNAMIC_SIZES || (shaka.util.EbmlParser.DYNAMIC_SIZES = [new Uint8Array([255]), new Uint8Array([127, 255]), new Uint8Array([63, 255, 255]), new Uint8Array([31, 255, 255, 255]), new Uint8Array([15, 255, 255, 255, 255]), new Uint8Array([7, 255, 255, 255, 255, 255]), new Uint8Array([3, 255, 255, 255, 255, 255, 255]), new Uint8Array([1, 255, 255, 255, 255, 255, 255, 255])])
        };
        shaka.util.EbmlParser.prototype.hasMoreData = function() {
            return this.reader_.hasMoreData()
        };
        shaka.util.EbmlParser.prototype.parseElement = function() {
            var a = this.parseId_(),
                b = this.parseVint_();
            b = shaka.util.EbmlParser.isDynamicSizeValue_(b) ? this.dataView_.byteLength - this.reader_.getPosition() : shaka.util.EbmlParser.getVintValue_(b);
            b = this.reader_.getPosition() + b <= this.dataView_.byteLength ? b : this.dataView_.byteLength - this.reader_.getPosition();
            var c = new DataView(this.dataView_.buffer, this.dataView_.byteOffset + this.reader_.getPosition(), b);
            this.reader_.skip(b);
            return new shaka.util.EbmlElement(a,
                c)
        };
        shaka.util.EbmlParser.prototype.parseId_ = function() {
            var a = this.parseVint_();
            if (7 < a.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.EBML_OVERFLOW);
            for (var b = 0, c = 0; c < a.length; c++) b = 256 * b + a[c];
            return b
        };
        shaka.util.EbmlParser.prototype.parseVint_ = function() {
            var a = this.reader_.readUint8(),
                b;
            for (b = 1; 8 >= b && !(a & 1 << 8 - b); b++);
            if (8 < b) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.EBML_OVERFLOW);
            var c = new Uint8Array(b);
            c[0] = a;
            for (a = 1; a < b; a++) c[a] = this.reader_.readUint8();
            return c
        };
        shaka.util.EbmlParser.getVintValue_ = function(a) {
            if (8 == a.length && a[1] & 224) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.JS_INTEGER_OVERFLOW);
            for (var b = a[0] & (1 << 8 - a.length) - 1, c = 1; c < a.length; c++) b = 256 * b + a[c];
            return b
        };
        shaka.util.EbmlParser.isDynamicSizeValue_ = function(a) {
            for (var b = shaka.util.EbmlParser, c = shaka.util.Uint8ArrayUtils.equal, d = 0; d < b.DYNAMIC_SIZES.length; d++)
                if (c(a, b.DYNAMIC_SIZES[d])) return !0;
            return !1
        };
        shaka.util.EbmlElement = function(a, b) {
            this.id = a;
            this.dataView_ = b
        };
        shaka.util.EbmlElement.prototype.getOffset = function() {
            return this.dataView_.byteOffset
        };
        shaka.util.EbmlElement.prototype.createParser = function() {
            return new shaka.util.EbmlParser(this.dataView_)
        };
        shaka.util.EbmlElement.prototype.getUint = function() {
            if (8 < this.dataView_.byteLength) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.EBML_OVERFLOW);
            if (8 == this.dataView_.byteLength && this.dataView_.getUint8(0) & 224) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.JS_INTEGER_OVERFLOW);
            for (var a = 0, b = 0; b < this.dataView_.byteLength; b++) {
                var c = this.dataView_.getUint8(b);
                a = 256 *
                    a + c
            }
            return a
        };
        shaka.util.EbmlElement.prototype.getFloat = function() {
            if (4 == this.dataView_.byteLength) return this.dataView_.getFloat32(0);
            if (8 == this.dataView_.byteLength) return this.dataView_.getFloat64(0);
            throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.EBML_BAD_FLOATING_POINT_SIZE);
        };
        shaka.media.WebmSegmentIndexParser = function() {};
        shaka.media.WebmSegmentIndexParser.EBML_ID = 440786851;
        shaka.media.WebmSegmentIndexParser.SEGMENT_ID = 408125543;
        shaka.media.WebmSegmentIndexParser.INFO_ID = 357149030;
        shaka.media.WebmSegmentIndexParser.TIMECODE_SCALE_ID = 2807729;
        shaka.media.WebmSegmentIndexParser.DURATION_ID = 17545;
        shaka.media.WebmSegmentIndexParser.CUES_ID = 475249515;
        shaka.media.WebmSegmentIndexParser.CUE_POINT_ID = 187;
        shaka.media.WebmSegmentIndexParser.CUE_TIME_ID = 179;
        shaka.media.WebmSegmentIndexParser.CUE_TRACK_POSITIONS_ID = 183;
        shaka.media.WebmSegmentIndexParser.CUE_CLUSTER_POSITION = 241;
        shaka.media.WebmSegmentIndexParser.prototype.parse = function(a, b, c, d) {
            b = this.parseWebmContainer_(b);
            a = (new shaka.util.EbmlParser(new DataView(a))).parseElement();
            if (a.id != shaka.media.WebmSegmentIndexParser.CUES_ID) throw shaka.log.error("Not a Cues element."), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.WEBM_CUES_ELEMENT_MISSING);
            return this.parseCues_(a, b.segmentOffset, b.timecodeScale, b.duration, c, d)
        };
        shaka.media.WebmSegmentIndexParser.prototype.parseWebmContainer_ = function(a) {
            a = new shaka.util.EbmlParser(new DataView(a));
            if (a.parseElement().id != shaka.media.WebmSegmentIndexParser.EBML_ID) throw shaka.log.error("Not an EBML element."), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.WEBM_EBML_HEADER_ELEMENT_MISSING);
            var b = a.parseElement();
            if (b.id != shaka.media.WebmSegmentIndexParser.SEGMENT_ID) throw shaka.log.error("Not a Segment element."),
                new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.WEBM_SEGMENT_ELEMENT_MISSING);
            a = b.getOffset();
            b = this.parseSegment_(b);
            return {
                segmentOffset: a,
                timecodeScale: b.timecodeScale,
                duration: b.duration
            }
        };
        shaka.media.WebmSegmentIndexParser.prototype.parseSegment_ = function(a) {
            a = a.createParser();
            for (var b = null; a.hasMoreData();) {
                var c = a.parseElement();
                if (c.id == shaka.media.WebmSegmentIndexParser.INFO_ID) {
                    b = c;
                    break
                }
            }
            if (!b) throw shaka.log.error("Not an Info element."), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.WEBM_INFO_ELEMENT_MISSING);
            return this.parseInfo_(b)
        };
        shaka.media.WebmSegmentIndexParser.prototype.parseInfo_ = function(a) {
            var b = a.createParser(),
                c = 1E6;
            for (a = null; b.hasMoreData();) {
                var d = b.parseElement();
                d.id == shaka.media.WebmSegmentIndexParser.TIMECODE_SCALE_ID ? c = d.getUint() : d.id == shaka.media.WebmSegmentIndexParser.DURATION_ID && (a = d.getFloat())
            }
            if (null == a) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.WEBM_DURATION_ELEMENT_MISSING);
            b = c / 1E9;
            return {
                timecodeScale: b,
                duration: a * b
            }
        };
        shaka.media.WebmSegmentIndexParser.prototype.parseCues_ = function(a, b, c, d, e, f) {
            var g = [],
                h = function() {
                    return e
                };
            a = a.createParser();
            for (var k = null, l = null; a.hasMoreData();) {
                var m = a.parseElement();
                if (m.id == shaka.media.WebmSegmentIndexParser.CUE_POINT_ID) {
                    var n = this.parseCuePoint_(m);
                    n && (m = c * n.unscaledTime, n = b + n.relativeOffset, null != k && (goog.asserts.assert(null != l, "last offset cannot be null"), g.push(new shaka.media.SegmentReference(g.length, k - f, m - f, h, l, n - 1))), k = m, l = n)
                }
            }
            null != k && (goog.asserts.assert(null !=
                l, "last offset cannot be null"), g.push(new shaka.media.SegmentReference(g.length, k - f, d - f, h, l, null)));
            return g
        };
        shaka.media.WebmSegmentIndexParser.prototype.parseCuePoint_ = function(a) {
            var b = a.createParser();
            a = b.parseElement();
            if (a.id != shaka.media.WebmSegmentIndexParser.CUE_TIME_ID) throw shaka.log.warning("Not a CueTime element."), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.WEBM_CUE_TIME_ELEMENT_MISSING);
            a = a.getUint();
            b = b.parseElement();
            if (b.id != shaka.media.WebmSegmentIndexParser.CUE_TRACK_POSITIONS_ID) throw shaka.log.warning("Not a CueTrackPositions element."),
                new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.WEBM_CUE_TRACK_POSITIONS_ELEMENT_MISSING);
            b = b.createParser();
            for (var c = 0; b.hasMoreData();) {
                var d = b.parseElement();
                if (d.id == shaka.media.WebmSegmentIndexParser.CUE_CLUSTER_POSITION) {
                    c = d.getUint();
                    break
                }
            }
            return {
                unscaledTime: a,
                relativeOffset: c
            }
        };
        shaka.dash.SegmentBase = {};
        shaka.dash.SegmentBase.createInitSegment = function(a, b) {
            var c = shaka.util.XmlUtils,
                d = shaka.util.ManifestParserUtils,
                e = shaka.dash.MpdUtils.inheritChild(a, b, "Initialization");
            if (!e) return null;
            var f = a.representation.baseUris,
                g = e.getAttribute("sourceURL");
            g && (f = d.resolveUris(a.representation.baseUris, [g]));
            d = 0;
            g = null;
            if (c = c.parseAttr(e, "range", c.parseRange)) d = c.start, g = c.end;
            return new shaka.media.InitSegmentReference(function() {
                return f
            }, d, g)
        };
        shaka.dash.SegmentBase.createStream = function(a, b) {
            goog.asserts.assert(a.representation.segmentBase, "Should only be called with SegmentBase");
            var c = shaka.dash.MpdUtils,
                d = shaka.dash.SegmentBase,
                e = shaka.util.XmlUtils,
                f = Number(c.inheritAttribute(a, d.fromInheritance_, "presentationTimeOffset")) || 0;
            c = c.inheritAttribute(a, d.fromInheritance_, "timescale");
            var g = 1;
            c && (g = e.parsePositiveInt(c) || 1);
            e = f / g || 0;
            f = d.createInitSegment(a, d.fromInheritance_);
            d = d.createSegmentIndex_(a, b, f, e);
            return {
                createSegmentIndex: d.createSegmentIndex,
                findSegmentPosition: d.findSegmentPosition,
                getSegmentReference: d.getSegmentReference,
                initSegmentReference: f,
                scaledPresentationTimeOffset: e
            }
        };
        shaka.dash.SegmentBase.createSegmentIndexFromUris = function(a, b, c, d, e, f, g, h) {
            var k = a.presentationTimeline,
                l = !a.dynamic || !a.periodInfo.isLastPeriod,
                m = a.periodInfo.start,
                n = a.periodInfo.duration,
                q = b,
                p = null;
            return {
                createSegmentIndex: function() {
                    var a = [q(d, e, f), "webm" == g ? q(c.getUris(), c.startByte, c.endByte) : null];
                    q = null;
                    return Promise.all(a).then(function(a) {
                        var b = a[0];
                        a = a[1] || null;
                        "mp4" == g ? b = shaka.media.Mp4SegmentIndexParser(b, e, d, h) : (goog.asserts.assert(a, "WebM requires init data"), b = (new shaka.media.WebmSegmentIndexParser).parse(b,
                            a, d, h));
                        k.notifySegments(b, m);
                        goog.asserts.assert(!p, "Should not call createSegmentIndex twice");
                        p = new shaka.media.SegmentIndex(b);
                        l && p.fit(n)
                    })
                },
                findSegmentPosition: function(a) {
                    goog.asserts.assert(p, "Must call createSegmentIndex first");
                    return p.find(a)
                },
                getSegmentReference: function(a) {
                    goog.asserts.assert(p, "Must call createSegmentIndex first");
                    return p.get(a)
                }
            }
        };
        shaka.dash.SegmentBase.fromInheritance_ = function(a) {
            return a.segmentBase
        };
        shaka.dash.SegmentBase.createSegmentIndex_ = function(a, b, c, d) {
            var e = shaka.dash.MpdUtils,
                f = shaka.dash.SegmentBase,
                g = shaka.util.XmlUtils,
                h = shaka.util.ManifestParserUtils,
                k = shaka.util.ManifestParserUtils.ContentType,
                l = a.representation.contentType,
                m = a.representation.mimeType.split("/")[1];
            if (l != k.TEXT && "mp4" != m && "webm" != m) throw shaka.log.error("SegmentBase specifies an unsupported container type.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST,
                shaka.util.Error.Code.DASH_UNSUPPORTED_CONTAINER);
            if ("webm" == m && !c) throw shaka.log.error("SegmentBase does not contain sufficient segment information:", "the SegmentBase uses a WebM container,", "but does not contain an Initialization element.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_WEBM_MISSING_INIT);
            k = e.inheritChild(a, f.fromInheritance_, "RepresentationIndex");
            f = e.inheritAttribute(a, f.fromInheritance_,
                "indexRange");
            e = a.representation.baseUris;
            f = g.parseRange(f || "");
            k && ((l = k.getAttribute("sourceURL")) && (e = h.resolveUris(a.representation.baseUris, [l])), f = g.parseAttr(k, "range", g.parseRange, f));
            if (!f) throw shaka.log.error("SegmentBase does not contain sufficient segment information:", "the SegmentBase does not contain @indexRange", "or a RepresentationIndex element.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_NO_SEGMENT_INFO);
            return shaka.dash.SegmentBase.createSegmentIndexFromUris(a, b, c, e, f.start, f.end, m, d)
        };
        shaka.dash.SegmentList = {};
        shaka.dash.SegmentList.createStream = function(a, b) {
            goog.asserts.assert(a.representation.segmentList, "Should only be called with SegmentList");
            var c = shaka.dash.SegmentList,
                d = shaka.dash.SegmentBase.createInitSegment(a, c.fromInheritance_),
                e = c.parseSegmentListInfo_(a);
            c.checkSegmentListInfo_(a, e);
            var f = null,
                g = null;
            a.period.id && a.representation.id && (g = a.period.id + "," + a.representation.id, f = b[g]);
            c = c.createSegmentReferences_(a.periodInfo.duration, e.startNumber, a.representation.baseUris, e);
            f ? (f.merge(c), g =
                a.presentationTimeline.getSegmentAvailabilityStart(), f.evict(g - a.periodInfo.start)) : (a.presentationTimeline.notifySegments(c, a.periodInfo.start), f = new shaka.media.SegmentIndex(c), g && a.dynamic && (b[g] = f));
            a.dynamic && a.periodInfo.isLastPeriod || f.fit(a.periodInfo.duration);
            return {
                createSegmentIndex: Promise.resolve.bind(Promise),
                findSegmentPosition: f.find.bind(f),
                getSegmentReference: f.get.bind(f),
                initSegmentReference: d,
                scaledPresentationTimeOffset: e.scaledPresentationTimeOffset
            }
        };
        shaka.dash.SegmentList.fromInheritance_ = function(a) {
            return a.segmentList
        };
        shaka.dash.SegmentList.parseSegmentListInfo_ = function(a) {
            var b = shaka.dash.SegmentList,
                c = shaka.dash.MpdUtils,
                d = b.parseMediaSegments_(a);
            a = c.parseSegmentInfo(a, b.fromInheritance_);
            b = a.startNumber;
            0 == b && (shaka.log.warning("SegmentList@startNumber must be > 0"), b = 1);
            c = 0;
            a.segmentDuration ? c = a.segmentDuration * (b - 1) : a.timeline && 0 < a.timeline.length && (c = a.timeline[0].start);
            return {
                segmentDuration: a.segmentDuration,
                startTime: c,
                startNumber: b,
                scaledPresentationTimeOffset: a.scaledPresentationTimeOffset,
                timeline: a.timeline,
                mediaSegments: d
            }
        };
        shaka.dash.SegmentList.checkSegmentListInfo_ = function(a, b) {
            if (!b.segmentDuration && !b.timeline && 1 < b.mediaSegments.length) throw shaka.log.warning("SegmentList does not contain sufficient segment information:", "the SegmentList specifies multiple segments,", "but does not specify a segment duration or timeline.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_NO_SEGMENT_INFO);
            if (!b.segmentDuration && !a.periodInfo.duration &&
                !b.timeline && 1 == b.mediaSegments.length) throw shaka.log.warning("SegmentList does not contain sufficient segment information:", "the SegmentList specifies one segment,", "but does not specify a segment duration, period duration,", "or timeline.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_NO_SEGMENT_INFO);
            if (b.timeline && 0 == b.timeline.length) throw shaka.log.warning("SegmentList does not contain sufficient segment information:",
                "the SegmentList has an empty timeline.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_NO_SEGMENT_INFO);
        };
        shaka.dash.SegmentList.createSegmentReferences_ = function(a, b, c, d) {
            var e = shaka.util.ManifestParserUtils,
                f = d.mediaSegments.length;
            d.timeline && d.timeline.length != d.mediaSegments.length && (f = Math.min(d.timeline.length, d.mediaSegments.length), shaka.log.warning("The number of items in the segment timeline and the number of segment", "URLs do not match, truncating", d.mediaSegments.length, "to", f));
            for (var g = [], h = d.startTime, k = 0; k < f; k++) {
                var l = d.mediaSegments[k],
                    m = e.resolveUris(c, [l.mediaUri]),
                    n = void 0;
                null !=
                    d.segmentDuration ? n = h + d.segmentDuration : d.timeline ? n = d.timeline[k].end : (goog.asserts.assert(1 == d.mediaSegments.length && a, "There should be exactly one segment with a Period duration."), n = h + a);
                m = function(a) {
                    return a
                }.bind(null, m);
                g.push(new shaka.media.SegmentReference(k + b, h, n, m, l.start, l.end));
                h = n
            }
            return g
        };
        shaka.dash.SegmentList.parseMediaSegments_ = function(a) {
            var b = [a.representation.segmentList, a.adaptationSet.segmentList, a.period.segmentList].filter(shaka.util.Functional.isNotNull),
                c = shaka.util.XmlUtils;
            return b.map(function(a) {
                return c.findChildren(a, "SegmentURL")
            }).reduce(function(a, b) {
                return 0 < a.length ? a : b
            }).map(function(b) {
                b.getAttribute("indexRange") && !a.indexRangeWarningGiven && (a.indexRangeWarningGiven = !0, shaka.log.warning("We do not support the SegmentURL@indexRange attribute on SegmentList.  We only use the SegmentList@duration attribute or SegmentTimeline, which must be accurate."));
                var d = b.getAttribute("media");
                b = c.parseAttr(b, "mediaRange", c.parseRange, {
                    start: 0,
                    end: null
                });
                return {
                    mediaUri: d,
                    start: b.start,
                    end: b.end
                }
            })
        };
        shaka.dash.SegmentTemplate = {};
        shaka.dash.SegmentTemplate.createStream = function(a, b, c, d) {
            goog.asserts.assert(a.representation.segmentTemplate, "Should only be called with SegmentTemplate");
            var e = shaka.dash.SegmentTemplate,
                f = e.createInitSegment_(a),
                g = e.parseSegmentTemplateInfo_(a);
            e.checkSegmentTemplateInfo_(a, g);
            if (g.indexTemplate) a = e.createFromIndexTemplate_(a, b, f, g);
            else if (g.segmentDuration) d || (a.presentationTimeline.notifyMaxSegmentDuration(g.segmentDuration), a.presentationTimeline.notifyMinSegmentStartTime(a.periodInfo.start)), a =
                e.createFromDuration_(a, g);
            else {
                d = b = null;
                a.period.id && a.representation.id && (d = a.period.id + "," + a.representation.id, b = c[d]);
                var h = e.createFromTimeline_(a, g);
                e = !a.dynamic || !a.periodInfo.isLastPeriod;
                b ? (e && (new shaka.media.SegmentIndex(h)).fit(a.periodInfo.duration), b.merge(h), c = a.presentationTimeline.getSegmentAvailabilityStart(), b.evict(c - a.periodInfo.start)) : (a.presentationTimeline.notifySegments(h, a.periodInfo.start), b = new shaka.media.SegmentIndex(h), d && a.dynamic && (c[d] = b));
                e && b.fit(a.periodInfo.duration);
                a = {
                    createSegmentIndex: Promise.resolve.bind(Promise),
                    findSegmentPosition: b.find.bind(b),
                    getSegmentReference: b.get.bind(b)
                }
            }
            return {
                createSegmentIndex: a.createSegmentIndex,
                findSegmentPosition: a.findSegmentPosition,
                getSegmentReference: a.getSegmentReference,
                initSegmentReference: f,
                scaledPresentationTimeOffset: g.scaledPresentationTimeOffset
            }
        };
        shaka.dash.SegmentTemplate.fromInheritance_ = function(a) {
            return a.segmentTemplate
        };
        shaka.dash.SegmentTemplate.parseSegmentTemplateInfo_ = function(a) {
            var b = shaka.dash.SegmentTemplate,
                c = shaka.dash.MpdUtils,
                d = c.parseSegmentInfo(a, b.fromInheritance_),
                e = c.inheritAttribute(a, b.fromInheritance_, "media");
            a = c.inheritAttribute(a, b.fromInheritance_, "index");
            return {
                segmentDuration: d.segmentDuration,
                timescale: d.timescale,
                startNumber: d.startNumber,
                scaledPresentationTimeOffset: d.scaledPresentationTimeOffset,
                unscaledPresentationTimeOffset: d.unscaledPresentationTimeOffset,
                timeline: d.timeline,
                mediaTemplate: e,
                indexTemplate: a
            }
        };
        shaka.dash.SegmentTemplate.checkSegmentTemplateInfo_ = function(a, b) {
            var c = b.indexTemplate ? 1 : 0;
            c += b.timeline ? 1 : 0;
            c += b.segmentDuration ? 1 : 0;
            if (0 == c) throw shaka.log.error("SegmentTemplate does not contain any segment information:", "the SegmentTemplate must contain either an index URL template", "a SegmentTimeline, or a segment duration.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_NO_SEGMENT_INFO);
            1 != c && (shaka.log.warning("SegmentTemplate containes multiple segment information sources:",
                "the SegmentTemplate should only contain an index URL template,", "a SegmentTimeline or a segment duration.", a.representation), b.indexTemplate ? (shaka.log.info("Using the index URL template by default."), b.timeline = null) : (goog.asserts.assert(b.timeline, "There should be a timeline"), shaka.log.info("Using the SegmentTimeline by default.")), b.segmentDuration = null);
            if (!b.indexTemplate && !b.mediaTemplate) throw shaka.log.error("SegmentTemplate does not contain sufficient segment information:", "the SegmentTemplate's media URL template is missing.",
                a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_NO_SEGMENT_INFO);
        };
        shaka.dash.SegmentTemplate.createFromIndexTemplate_ = function(a, b, c, d) {
            var e = shaka.dash.MpdUtils,
                f = shaka.util.ManifestParserUtils,
                g = a.representation.mimeType.split("/")[1];
            if ("mp4" != g && "webm" != g) throw shaka.log.error("SegmentTemplate specifies an unsupported container type.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_UNSUPPORTED_CONTAINER);
            if ("webm" == g && !c) throw shaka.log.error("SegmentTemplate does not contain sufficient segment information:",
                "the SegmentTemplate uses a WebM container,", "but does not contain an initialization URL template.", a.representation), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_WEBM_MISSING_INIT);
            goog.asserts.assert(d.indexTemplate, "must be using index template");
            e = e.fillUriTemplate(d.indexTemplate, a.representation.id, null, a.bandwidth || null, null);
            f = f.resolveUris(a.representation.baseUris, [e]);
            return shaka.dash.SegmentBase.createSegmentIndexFromUris(a,
                b, c, f, 0, null, g, d.scaledPresentationTimeOffset)
        };
        shaka.dash.SegmentTemplate.createFromDuration_ = function(a, b) {
            goog.asserts.assert(b.mediaTemplate, "There should be a media template with duration");
            var c = shaka.dash.MpdUtils,
                d = shaka.util.ManifestParserUtils,
                e = a.periodInfo.duration,
                f = b.segmentDuration,
                g = b.startNumber,
                h = b.timescale,
                k = b.mediaTemplate,
                l = a.bandwidth || null,
                m = a.representation.id,
                n = a.representation.baseUris;
            return {
                createSegmentIndex: Promise.resolve.bind(Promise),
                findSegmentPosition: function(a) {
                    return 0 > a || e && a >= e ? null : Math.floor(a / f)
                },
                getSegmentReference: function(a) {
                    var b =
                        a * f,
                        q = b + f;
                    e && (q = Math.min(q, e));
                    return 0 > q || e && b >= e ? null : new shaka.media.SegmentReference(a, b, q, function() {
                        var e = c.fillUriTemplate(k, m, a + g, l, b * h);
                        return d.resolveUris(n, [e])
                    }, 0, null)
                }
            }
        };
        shaka.dash.SegmentTemplate.createFromTimeline_ = function(a, b) {
            goog.asserts.assert(b.mediaTemplate, "There should be a media template with a timeline");
            for (var c = shaka.dash.MpdUtils, d = shaka.util.ManifestParserUtils, e = [], f = 0; f < b.timeline.length; f++) {
                var g = b.timeline[f].start,
                    h = b.timeline[f].end,
                    k = f + b.startNumber,
                    l = function(a, b, e, f, g, h) {
                        a = c.fillUriTemplate(a, b, g, e, h);
                        return d.resolveUris(f, [a]).map(function(a) {
                            return a.toString()
                        })
                    }.bind(null, b.mediaTemplate, a.representation.id, a.bandwidth || null, a.representation.baseUris,
                        k, b.timeline[f].unscaledStart + b.unscaledPresentationTimeOffset);
                e.push(new shaka.media.SegmentReference(k, g, h, l, 0, null))
            }
            return e
        };
        shaka.dash.SegmentTemplate.createInitSegment_ = function(a) {
            var b = shaka.dash.MpdUtils,
                c = shaka.util.ManifestParserUtils,
                d = b.inheritAttribute(a, shaka.dash.SegmentTemplate.fromInheritance_, "initialization");
            if (!d) return null;
            var e = a.representation.id,
                f = a.bandwidth || null,
                g = a.representation.baseUris;
            return new shaka.media.InitSegmentReference(function() {
                goog.asserts.assert(d, "Should have returned earler");
                var a = b.fillUriTemplate(d, e, null, f, null);
                return c.resolveUris(g, [a])
            }, 0, null)
        };
        shaka.media.ManifestParser = {};
        shaka.media.ManifestParser.parsersByMime = {};
        shaka.media.ManifestParser.parsersByExtension = {};
        shaka.media.ManifestParser.registerParserByExtension = function(a, b) {
            shaka.media.ManifestParser.parsersByExtension[a] = b
        };
        goog.exportSymbol("shaka.media.ManifestParser.registerParserByExtension", shaka.media.ManifestParser.registerParserByExtension);
        shaka.media.ManifestParser.registerParserByMime = function(a, b) {
            shaka.media.ManifestParser.parsersByMime[a] = b
        };
        goog.exportSymbol("shaka.media.ManifestParser.registerParserByMime", shaka.media.ManifestParser.registerParserByMime);
        shaka.media.ManifestParser.probeSupport = function() {
            var a = shaka.media.ManifestParser,
                b = {};
            if (shaka.util.Platform.supportsMediaSource()) {
                for (var c in a.parsersByMime) b[c] = !0;
                for (var d in a.parsersByExtension) b[d] = !0
            }
            c = {
                mpd: "application/dash+xml",
                m3u8: "application/x-mpegurl",
                ism: "application/vnd.ms-sstr+xml"
            };
            d = $jscomp.makeIterator(["application/dash+xml", "application/x-mpegurl", "application/vnd.apple.mpegurl", "application/vnd.ms-sstr+xml"]);
            for (var e = d.next(); !e.done; e = d.next()) e = e.value, shaka.util.Platform.supportsMediaSource() ?
                b[e] = !!a.parsersByMime[e] : b[e] = shaka.util.Platform.supportsMediaType(e);
            for (var f in c) shaka.util.Platform.supportsMediaSource() ? b[f] = !!a.parsersByExtension[f] : b[f] = shaka.util.Platform.supportsMediaType(c[f]);
            return b
        };
        shaka.media.ManifestParser.create = function(a, b, c, d) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                var g, h;
                return $jscomp.generator.createGenerator(f, function(f) {
                    switch (f.nextAddress) {
                        case 1:
                            return f.setCatchFinallyBlocks(2), f.yield(shaka.media.ManifestParser.getFactory_(a, b, c, d), 4);
                        case 4:
                            return g = f.yieldResult, f["return"](new g);
                        case 2:
                            throw h = f.enterCatchBlock(), goog.asserts.assert(h instanceof shaka.util.Error, "Incorrect error type"), h.severity = shaka.util.Error.Severity.CRITICAL,
                                h;
                    }
                })
            })
        };
        shaka.media.ManifestParser.getFactory_ = function(a, b, c, d) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                var g, h, k, l, m;
                return $jscomp.generator.createGenerator(f, function(f) {
                    switch (f.nextAddress) {
                        case 1:
                            g = shaka.media.ManifestParser;
                            if (d) {
                                if (h = g.parsersByMime[d.toLowerCase()]) return f["return"](h);
                                shaka.log.warning("Could not determine manifest type using MIME type ", d)
                            }
                            if (k = g.getExtension(a)) {
                                if (l = g.parsersByExtension[k]) return f["return"](l);
                                shaka.log.warning("Could not determine manifest type for extension ", k)
                            } else shaka.log.warning("Could not find extension for ",
                                a);
                            if (d) {
                                f.jumpTo(2);
                                break
                            }
                            return f.yield(g.getMimeType(a, b, c), 3);
                        case 3:
                            if (d = f.yieldResult) {
                                if (m = shaka.media.ManifestParser.parsersByMime[d]) return f["return"](m);
                                shaka.log.warning("Could not determine manifest type using MIME type", d)
                            }
                            case 2:
                                throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.UNABLE_TO_GUESS_MANIFEST_TYPE, a);
                    }
                })
            })
        };
        shaka.media.ManifestParser.getMimeType = function(a, b, c) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return f = shaka.net.NetworkingEngine.RequestType.MANIFEST, g = shaka.net.NetworkingEngine.makeRequest([a], c), g.method = "HEAD", e.yield(b.request(f, g).promise, 2);
                        case 2:
                            return h = e.yieldResult, k = h.headers["content-type"], e["return"](k ? k.toLowerCase().split(";").shift() : "")
                    }
                })
            })
        };
        shaka.media.ManifestParser.getExtension = function(a) {
            a = (new goog.Uri(a)).getPath().split("/").pop().split(".");
            return 1 == a.length ? "" : a.pop().toLowerCase()
        };
        shaka.media.ManifestParser.isSupported = function(a, b) {
            return shaka.util.Platform.supportsMediaSource() ? b in shaka.media.ManifestParser.parsersByMime || shaka.media.ManifestParser.getExtension(a) in shaka.media.ManifestParser.parsersByExtension ? !0 : !1 : !1
        };
        shaka.media.PresentationTimeline = function(a, b, c) {
            this.presentationStartTime_ = a;
            this.presentationDelay_ = b;
            this.segmentAvailabilityDuration_ = this.duration_ = Infinity;
            this.maxSegmentDuration_ = 1;
            this.maxSegmentEndTime_ = this.minSegmentStartTime_ = null;
            this.clockOffset_ = 0;
            this.static_ = !0;
            this.userSeekStart_ = 0;
            this.autoCorrectDrift_ = void 0 === c ? !0 : c
        };
        goog.exportSymbol("shaka.media.PresentationTimeline", shaka.media.PresentationTimeline);
        shaka.media.PresentationTimeline.prototype.getDuration = function() {
            return this.duration_
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getDuration", shaka.media.PresentationTimeline.prototype.getDuration);
        shaka.media.PresentationTimeline.prototype.getMaxSegmentDuration = function() {
            return this.maxSegmentDuration_
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getMaxSegmentDuration", shaka.media.PresentationTimeline.prototype.getMaxSegmentDuration);
        shaka.media.PresentationTimeline.prototype.setDuration = function(a) {
            goog.asserts.assert(0 < a, "duration must be > 0");
            this.duration_ = a
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "setDuration", shaka.media.PresentationTimeline.prototype.setDuration);
        shaka.media.PresentationTimeline.prototype.getPresentationStartTime = function() {
            return this.presentationStartTime_
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getPresentationStartTime", shaka.media.PresentationTimeline.prototype.getPresentationStartTime);
        shaka.media.PresentationTimeline.prototype.setClockOffset = function(a) {
            this.clockOffset_ = a
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "setClockOffset", shaka.media.PresentationTimeline.prototype.setClockOffset);
        shaka.media.PresentationTimeline.prototype.setStatic = function(a) {
            this.static_ = a
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "setStatic", shaka.media.PresentationTimeline.prototype.setStatic);
        shaka.media.PresentationTimeline.prototype.setSegmentAvailabilityDuration = function(a) {
            goog.asserts.assert(0 <= a, "segmentAvailabilityDuration must be >= 0");
            this.segmentAvailabilityDuration_ = a
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "setSegmentAvailabilityDuration", shaka.media.PresentationTimeline.prototype.setSegmentAvailabilityDuration);
        shaka.media.PresentationTimeline.prototype.setDelay = function(a) {
            goog.asserts.assert(0 <= a, "delay must be >= 0");
            this.presentationDelay_ = a
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "setDelay", shaka.media.PresentationTimeline.prototype.setDelay);
        shaka.media.PresentationTimeline.prototype.getDelay = function() {
            return this.presentationDelay_
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getDelay", shaka.media.PresentationTimeline.prototype.getDelay);
        shaka.media.PresentationTimeline.prototype.notifySegments = function(a, b) {
            if (0 != a.length) {
                var c = a[a.length - 1].endTime + b;
                this.notifyMinSegmentStartTime(a[0].startTime + b);
                this.maxSegmentDuration_ = a.reduce(function(a, b) {
                    return Math.max(a, b.endTime - b.startTime)
                }, this.maxSegmentDuration_);
                this.maxSegmentEndTime_ = Math.max(this.maxSegmentEndTime_, c);
                null != this.presentationStartTime_ && this.autoCorrectDrift_ && (this.presentationStartTime_ = (Date.now() + this.clockOffset_) / 1E3 - this.maxSegmentEndTime_ - this.maxSegmentDuration_);
                shaka.log.v1("notifySegments:", "maxSegmentDuration=" + this.maxSegmentDuration_)
            }
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "notifySegments", shaka.media.PresentationTimeline.prototype.notifySegments);
        shaka.media.PresentationTimeline.prototype.notifyMinSegmentStartTime = function(a) {
            this.minSegmentStartTime_ = null == this.minSegmentStartTime_ ? a : Math.min(this.minSegmentStartTime_, a)
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "notifyMinSegmentStartTime", shaka.media.PresentationTimeline.prototype.notifyMinSegmentStartTime);
        shaka.media.PresentationTimeline.prototype.notifyMaxSegmentDuration = function(a) {
            this.maxSegmentDuration_ = Math.max(this.maxSegmentDuration_, a);
            shaka.log.v1("notifyNewSegmentDuration:", "maxSegmentDuration=" + this.maxSegmentDuration_)
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "notifyMaxSegmentDuration", shaka.media.PresentationTimeline.prototype.notifyMaxSegmentDuration);
        shaka.media.PresentationTimeline.prototype.offset = function(a) {
            null != this.minSegmentStartTime_ && (this.minSegmentStartTime_ += a);
            null != this.maxSegmentEndTime_ && (this.maxSegmentEndTime_ += a)
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "offset", shaka.media.PresentationTimeline.prototype.offset);
        shaka.media.PresentationTimeline.prototype.isLive = function() {
            return Infinity == this.duration_ && !this.static_
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "isLive", shaka.media.PresentationTimeline.prototype.isLive);
        shaka.media.PresentationTimeline.prototype.isInProgress = function() {
            return Infinity != this.duration_ && !this.static_
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "isInProgress", shaka.media.PresentationTimeline.prototype.isInProgress);
        shaka.media.PresentationTimeline.prototype.getSegmentAvailabilityStart = function() {
            goog.asserts.assert(0 <= this.segmentAvailabilityDuration_, "The availability duration should be positive");
            if (Infinity == this.segmentAvailabilityDuration_) return this.userSeekStart_;
            var a = this.getSegmentAvailabilityEnd() - this.segmentAvailabilityDuration_;
            return Math.max(this.userSeekStart_, a)
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getSegmentAvailabilityStart", shaka.media.PresentationTimeline.prototype.getSegmentAvailabilityStart);
        shaka.media.PresentationTimeline.prototype.setUserSeekStart = function(a) {
            this.userSeekStart_ = a
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "setUserSeekStart", shaka.media.PresentationTimeline.prototype.setUserSeekStart);
        shaka.media.PresentationTimeline.prototype.getSegmentAvailabilityEnd = function() {
            return this.isLive() || this.isInProgress() ? Math.min(this.getLiveEdge_(), this.duration_) : this.duration_
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getSegmentAvailabilityEnd", shaka.media.PresentationTimeline.prototype.getSegmentAvailabilityEnd);
        shaka.media.PresentationTimeline.prototype.getSafeSeekRangeStart = function(a) {
            var b = Math.max(this.minSegmentStartTime_, this.userSeekStart_);
            if (Infinity == this.segmentAvailabilityDuration_) return b;
            var c = this.getSegmentAvailabilityEnd() - this.segmentAvailabilityDuration_;
            a = Math.min(c + a, this.getSeekRangeEnd());
            return Math.max(b, a)
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getSafeSeekRangeStart", shaka.media.PresentationTimeline.prototype.getSafeSeekRangeStart);
        shaka.media.PresentationTimeline.prototype.getSeekRangeStart = function() {
            return this.getSafeSeekRangeStart(0)
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getSeekRangeStart", shaka.media.PresentationTimeline.prototype.getSeekRangeStart);
        shaka.media.PresentationTimeline.prototype.getSeekRangeEnd = function() {
            var a = this.isLive() || this.isInProgress() ? this.presentationDelay_ : 0;
            return Math.max(0, this.getSegmentAvailabilityEnd() - a)
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "getSeekRangeEnd", shaka.media.PresentationTimeline.prototype.getSeekRangeEnd);
        shaka.media.PresentationTimeline.prototype.usingPresentationStartTime = function() {
            return null == this.presentationStartTime_ || null != this.maxSegmentEndTime_ && this.autoCorrectDrift_ ? !1 : !0
        };
        goog.exportProperty(shaka.media.PresentationTimeline.prototype, "usingPresentationStartTime", shaka.media.PresentationTimeline.prototype.usingPresentationStartTime);
        shaka.media.PresentationTimeline.prototype.getLiveEdge_ = function() {
            goog.asserts.assert(null != this.presentationStartTime_, "Cannot compute timeline live edge without start time");
            var a = (Date.now() + this.clockOffset_) / 1E3;
            return Math.max(0, a - this.maxSegmentDuration_ - this.presentationStartTime_)
        };
        goog.DEBUG && (shaka.media.PresentationTimeline.prototype.assertIsValid = function() {
            this.isLive() ? goog.asserts.assert(null != this.presentationStartTime_, "Detected as live stream, but does not match our model of live!") : this.isInProgress() ? goog.asserts.assert(null != this.presentationStartTime_ && Infinity == this.segmentAvailabilityDuration_, "Detected as IPR stream, but does not match our model of IPR!") : goog.asserts.assert(Infinity == this.segmentAvailabilityDuration_ && Infinity != this.duration_ && this.static_,
                "Detected as VOD stream, but does not match our model of VOD!")
        });
        shaka.util.Networking = function() {};
        shaka.util.Networking.createSegmentRequest = function(a, b, c, d) {
            a = shaka.net.NetworkingEngine.makeRequest(a, d);
            if (0 != b || null != c) a.headers.Range = c ? "bytes=" + b + "-" + c : "bytes=" + b + "-";
            return a
        };
        shaka.dash.DashParser = function() {
            var a = this;
            this.playerInterface_ = this.config_ = null;
            this.manifestUris_ = [];
            this.manifest_ = null;
            this.periodIds_ = [];
            this.globalId_ = 1;
            this.segmentIndexMap_ = {};
            this.updatePeriod_ = 0;
            this.averageUpdateDuration_ = new shaka.abr.Ewma(5);
            this.updateTimer_ = new shaka.util.Timer(function() {
                a.onUpdate_()
            });
            this.operationManager_ = new shaka.util.OperationManager
        };
        goog.exportSymbol("shaka.dash.DashParser", shaka.dash.DashParser);
        shaka.dash.DashParser.MIN_UPDATE_PERIOD_ = 3;
        shaka.dash.DashParser.prototype.configure = function(a) {
            goog.asserts.assert(null != a.dash, "DashManifestConfiguration should not be null!");
            this.config_ = a
        };
        shaka.dash.DashParser.prototype.start = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return goog.asserts.assert(c.config_, "Must call configure() before start()!"), c.manifestUris_ = [a], c.playerInterface_ = b, e.yield(c.requestManifest_(), 2);
                        case 2:
                            f = e.yieldResult;
                            c.playerInterface_ && c.setUpdateTimer_(f);
                            if (!c.playerInterface_) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                                shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.OPERATION_ABORTED);
                            goog.asserts.assert(c.manifest_, "Manifest should be non-null!");
                            return e["return"](c.manifest_)
                    }
                })
            })
        };
        shaka.dash.DashParser.prototype.stop = function() {
            this.config_ = this.playerInterface_ = null;
            this.manifestUris_ = [];
            this.manifest_ = null;
            this.periodIds_ = [];
            this.segmentIndexMap_ = {};
            null != this.updateTimer_ && (this.updateTimer_.stop(), this.updateTimer_ = null);
            return this.operationManager_.destroy()
        };
        shaka.dash.DashParser.prototype.update = function() {
            this.requestManifest_()["catch"](function(a) {
                if (this.playerInterface_) this.playerInterface_.onError(a)
            }.bind(this))
        };
        shaka.dash.DashParser.prototype.onExpirationUpdated = function(a, b) {};
        shaka.dash.DashParser.prototype.requestManifest_ = function() {
            var a = this,
                b = shaka.net.NetworkingEngine.RequestType.MANIFEST,
                c = shaka.net.NetworkingEngine.makeRequest(this.manifestUris_, this.config_.retryParameters),
                d = this.playerInterface_.networkingEngine,
                e = Date.now();
            b = d.request(b, c);
            this.operationManager_.manage(b);
            return b.promise.then(function(b) {
                if (a.playerInterface_) return b.uri && !a.manifestUris_.includes(b.uri) && a.manifestUris_.unshift(b.uri), a.parseManifest_(b.data, b.uri)
            }).then(function() {
                var b =
                    (Date.now() - e) / 1E3;
                a.averageUpdateDuration_.sample(1, b);
                return b
            })
        };
        shaka.dash.DashParser.prototype.parseManifest_ = function(a, b) {
            var c = this,
                d = shaka.util.Error,
                e = shaka.dash.MpdUtils,
                f = shaka.util.XmlUtils.parseXml(a, "MPD");
            if (!f) throw new d(d.Severity.CRITICAL, d.Category.MANIFEST, d.Code.DASH_INVALID_XML, b);
            d = e.processXlinks(f, this.config_.retryParameters, this.config_.dash.xlinkFailGracefully, b, this.playerInterface_.networkingEngine);
            this.operationManager_.manage(d);
            return d.promise.then(function(a) {
                return c.processManifest_(a, b)
            })
        };
        shaka.dash.DashParser.prototype.processManifest_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l, m, n, q, p, t, r, v, u, y, w, x, G, D, H, C, z, A, E, F, B;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            f = shaka.util.Functional;
                            g = shaka.util.XmlUtils;
                            h = [b];
                            k = g.findChildren(a, "Location").map(g.getContents).filter(f.isNotNull);
                            0 < k.length && (l = shaka.util.ManifestParserUtils.resolveUris(h, k), h = c.manifestUris_ = l);
                            m = g.findChildren(a,
                                "BaseURL").map(g.getContents);
                            n = shaka.util.ManifestParserUtils.resolveUris(h, m);
                            q = c.config_.dash.ignoreMinBufferTime;
                            p = 0;
                            q || (p = g.parseAttr(a, "minBufferTime", g.parseDuration));
                            c.updatePeriod_ = g.parseAttr(a, "minimumUpdatePeriod", g.parseDuration, -1);
                            t = g.parseAttr(a, "availabilityStartTime", g.parseDate);
                            r = g.parseAttr(a, "timeShiftBufferDepth", g.parseDuration);
                            v = g.parseAttr(a, "maxSegmentDuration", g.parseDuration);
                            u = a.getAttribute("type") || "static";
                            y = c.config_.dash.ignoreSuggestedPresentationDelay;
                            w = null;
                            y || (w = g.parseAttr(a, "suggestedPresentationDelay", g.parseDuration));
                            c.manifest_ ? x = c.manifest_.presentationTimeline : (G = Math.max(c.config_.dash.defaultPresentationDelay, 1.5 * p), D = null != w ? w : G, x = new shaka.media.PresentationTimeline(t, D, c.config_.dash.autoCorrectDrift));
                            H = {
                                dynamic: "static" != u,
                                presentationTimeline: x,
                                period: null,
                                periodInfo: null,
                                adaptationSet: null,
                                representation: null,
                                bandwidth: 0,
                                indexRangeWarningGiven: !1
                            };
                            C = c.parsePeriods_(H, n, a);
                            z = C.duration;
                            A = C.periods;
                            x.setStatic("static" == u);
                            "static" !=
                            u && C.durationDerivedFromPeriods || x.setDuration(z || Infinity);
                            (E = x.isLive()) && !isNaN(c.config_.availabilityWindowOverride) && (r = c.config_.availabilityWindowOverride);
                            null == r && (r = Infinity);
                            x.setSegmentAvailabilityDuration(r);
                            x.notifyMaxSegmentDuration(v || 1);
                            goog.DEBUG && x.assertIsValid();
                            if (c.manifest_) {
                                e.jumpTo(0);
                                break
                            }
                            c.manifest_ = {
                                presentationTimeline: x,
                                periods: A,
                                offlineSessionIds: [],
                                minBufferTime: p || 0
                            };
                            if (!x.usingPresentationStartTime()) {
                                e.jumpTo(0);
                                break
                            }
                            F = g.findChildren(a, "UTCTiming");
                            return e.yield(c.parseUtcTiming_(n,
                                F), 4);
                        case 4:
                            B = e.yieldResult;
                            if (!c.playerInterface_) return e["return"]();
                            x.setClockOffset(B);
                            e.jumpToEnd()
                    }
                })
            })
        };
        shaka.dash.DashParser.prototype.parsePeriods_ = function(a, b, c) {
            var d = shaka.util.XmlUtils,
                e = d.parseAttr(c, "mediaPresentationDuration", d.parseDuration),
                f = [],
                g = 0;
            c = d.findChildren(c, "Period");
            for (var h = 0; h < c.length; h++) {
                var k = c[h];
                g = d.parseAttr(k, "start", d.parseDuration, g);
                var l = d.parseAttr(k, "duration", d.parseDuration),
                    m = null;
                if (h != c.length - 1) {
                    var n = d.parseAttr(c[h + 1], "start", d.parseDuration);
                    null != n && (m = n - g)
                } else null != e && (m = e - g);
                n = shaka.util.ManifestParserUtils.GAP_OVERLAP_TOLERANCE_SECONDS;
                m && l && Math.abs(m -
                    l) > n && shaka.log.warning("There is a gap/overlap between Periods", k);
                null == m && (m = l);
                k = this.parsePeriod_(a, b, {
                    start: g,
                    duration: m,
                    node: k,
                    isLastPeriod: null == m || h == c.length - 1
                });
                f.push(k);
                l = a.period.id;
                goog.asserts.assert(l, "Period IDs should not be null!");
                this.periodIds_.includes(l) || (this.periodIds_.push(l), this.manifest_ && (this.playerInterface_.filterNewPeriod(k), this.manifest_.periods.push(k)));
                if (null == m) {
                    h != c.length - 1 && shaka.log.warning("Skipping Period", h + 1, "and any subsequent Periods:", "Period",
                        h + 1, "does not have a valid start time.", f[h + 1]);
                    g = null;
                    break
                }
                g += m
            }
            null == this.manifest_ && this.playerInterface_.filterAllPeriods(f);
            return null != e ? (g != e && shaka.log.warning("@mediaPresentationDuration does not match the total duration of all", "Periods."), {
                periods: f,
                duration: e,
                durationDerivedFromPeriods: !1
            }) : {
                periods: f,
                duration: g,
                durationDerivedFromPeriods: !0
            }
        };
        shaka.dash.DashParser.prototype.parsePeriod_ = function(a, b, c) {
            var d = shaka.util.Functional,
                e = shaka.util.XmlUtils,
                f = shaka.util.ManifestParserUtils.ContentType;
            a.period = this.createFrame_(c.node, null, b);
            a.periodInfo = c;
            a.period.id || (shaka.log.info("No Period ID given for Period with start time " + c.start + ",  Assigning a default"), a.period.id = "__shaka_period_" + c.start);
            e.findChildren(c.node, "EventStream").forEach(this.parseEventStream_.bind(this, c.start, c.duration));
            b = e.findChildren(c.node, "AdaptationSet").map(this.parseAdaptationSet_.bind(this,
                a)).filter(d.isNotNull);
            if (a.dynamic) {
                a = [];
                d = $jscomp.makeIterator(b);
                for (e = d.next(); !e.done; e = d.next()) {
                    e = $jscomp.makeIterator(e.value.representationIds);
                    for (var g = e.next(); !g.done; g = e.next()) a.push(g.value)
                }
                d = new Set(a);
                if (a.length != d.size) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_DUPLICATE_REPRESENTATION_ID);
            }
            var h = b.filter(function(a) {
                return !a.trickModeFor
            });
            b.filter(function(a) {
                return a.trickModeFor
            }).forEach(function(a) {
                var b =
                    a.trickModeFor.split(" ");
                h.forEach(function(c) {
                    b.includes(c.id) && c.streams.forEach(function(b) {
                        var c = shaka.util.MimeUtils;
                        b.trickModeVideo = a.streams.find(function(a) {
                            return c.getCodecBase(b.codecs) == c.getCodecBase(a.codecs)
                        })
                    })
                })
            });
            a = this.getSetsOfType_(h, f.VIDEO);
            d = this.getSetsOfType_(h, f.AUDIO);
            if (!a.length && !d.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_EMPTY_PERIOD);
            b = this.config_.disableAudio;
            if (!d.length ||
                b) d = [null];
            b = this.config_.disableVideo;
            if (!a.length || b) a = [null];
            b = [];
            for (e = 0; e < d.length; e++)
                for (g = 0; g < a.length; g++) this.createVariants_(d[e], a[g], b);
            a = [];
            if (!this.config_.disableText)
                for (f = this.getSetsOfType_(h, f.TEXT), d = 0; d < f.length; d++) a.push.apply(a, f[d].streams);
            return {
                startTime: c.start,
                textStreams: a,
                variants: b
            }
        };
        shaka.dash.DashParser.prototype.getSetsOfType_ = function(a, b) {
            return a.filter(function(a) {
                return a.contentType == b
            })
        };
        shaka.dash.DashParser.prototype.createVariants_ = function(a, b, c) {
            var d = shaka.util.ManifestParserUtils.ContentType;
            goog.asserts.assert(!a || a.contentType == d.AUDIO, "Audio parameter mismatch!");
            goog.asserts.assert(!b || b.contentType == d.VIDEO, "Video parameter mismatch!");
            if (a || b)
                if (a && b) {
                    if (d = shaka.media.DrmEngine, d.areDrmCompatible(a.drmInfos, b.drmInfos))
                        for (var e = d.getCommonDrmInfos(a.drmInfos, b.drmInfos), f = 0; f < a.streams.length; f++)
                            for (var g = 0; g < b.streams.length; g++) d = (b.streams[g].bandwidth || 0) + (a.streams[f].bandwidth ||
                                0), d = {
                                id: this.globalId_++,
                                language: a.language,
                                primary: a.main || b.main,
                                audio: a.streams[f],
                                video: b.streams[g],
                                bandwidth: d,
                                drmInfos: e,
                                allowedByApplication: !0,
                                allowedByKeySystem: !0
                            }, c.push(d)
                } else
                    for (e = a || b, f = 0; f < e.streams.length; f++) d = e.streams[f].bandwidth || 0, d = {
                        id: this.globalId_++,
                        language: e.language || "und",
                        primary: e.main,
                        audio: a ? e.streams[f] : null,
                        video: b ? e.streams[f] : null,
                        bandwidth: d,
                        drmInfos: e.drmInfos,
                        allowedByApplication: !0,
                        allowedByKeySystem: !0
                    }, c.push(d)
        };
        shaka.dash.DashParser.prototype.parseAdaptationSet_ = function(a, b) {
            var c = shaka.util.XmlUtils,
                d = shaka.util.Functional,
                e = shaka.util.ManifestParserUtils,
                f = e.ContentType;
            a.adaptationSet = this.createFrame_(b, a.period, null);
            if (a.adaptationSet.contentType == f.IMAGE) return shaka.log.warning("Skipping Image AdaptationSet", a.adaptationSet), null;
            var g = !1,
                h = c.findChildren(b, "Role"),
                k = h.map(function(a) {
                    return a.getAttribute("value")
                }).filter(d.isNotNull),
                l = void 0;
            if (d = a.adaptationSet.contentType == e.ContentType.TEXT) l =
                e.TextStreamKind.SUBTITLE;
            for (var m = 0; m < h.length; m++) {
                var n = h[m].getAttribute("schemeIdUri");
                if (null == n || "urn:mpeg:dash:role:2011" == n) switch (n = h[m].getAttribute("value"), n) {
                    case "main":
                        g = !0;
                        break;
                    case "caption":
                    case "subtitle":
                        l = n
                }
            }
            var q = null,
                p = !1;
            c.findChildren(b, "EssentialProperty").forEach(function(a) {
                "http://dashif.org/guidelines/trickmode" == a.getAttribute("schemeIdUri") ? q = a.getAttribute("value") : p = !0
            });
            m = c.findChildren(b, "Accessibility");
            var t = shaka.util.LanguageUtils,
                r = new Map;
            h = {};
            m = $jscomp.makeIterator(m);
            for (n = m.next(); !n.done; h = {
                    channelId: h.channelId
                }, n = m.next()) {
                var v = n.value;
                n = v.getAttribute("schemeIdUri");
                v = v.getAttribute("value");
                "urn:scte:dash:cc:cea-608:2015" == n || "urn:scte:dash:cc:cea-708:2015" == n ? (h.channelId = 1, null != v ? v.split(";").forEach(function(a) {
                        return function(b) {
                            if (b.includes("=")) {
                                b = b.split("=");
                                var c = b[0].startsWith("CC") ? b[0] : "CC" + b[0];
                                b = b[1].split(",")[0].split(":").pop()
                            } else c = "CC" + a.channelId, a.channelId += 2;
                            r.set(c, t.normalize(b))
                        }
                    }(h)) : r.set("CC1", "und")) : "urn:mpeg:dash:role:2011" ==
                    n && null != v && (k.push(v), "captions" == v && (l = e.TextStreamKind.CLOSED_CAPTION))
            }
            if (p) return null;
            e = c.findChildren(b, "ContentProtection");
            var u = shaka.dash.ContentProtection.parseFromAdaptationSet(e, this.config_.dash.customScheme, this.config_.dash.ignoreDrmInfo);
            e = shaka.util.LanguageUtils.normalize(b.getAttribute("lang") || "und");
            h = b.getAttribute("label");
            (m = c.findChildren(b, "Label")) && m.length && (m = m[0], m.textContent && (h = m.textContent));
            c = c.findChildren(b, "Representation");
            k = c.map(this.parseRepresentation_.bind(this,
                a, u, l, e, h, g, k, r)).filter(function(a) {
                return !!a
            });
            if (0 == k.length) {
                if (this.config_.dash.ignoreEmptyAdaptationSet || d) return null;
                throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.DASH_EMPTY_ADAPTATION_SET);
            }
            a.adaptationSet.contentType && a.adaptationSet.contentType != f.APPLICATION || (a.adaptationSet.contentType = shaka.dash.DashParser.guessContentType_(k[0].mimeType, k[0].codecs), k.forEach(function(b) {
                b.type = a.adaptationSet.contentType
            }));
            k.forEach(function(a) {
                u.drmInfos.forEach(function(b) {
                    a.keyId && b.keyIds.push(a.keyId)
                })
            });
            f = c.map(function(a) {
                return a.getAttribute("id")
            }).filter(shaka.util.Functional.isNotNull);
            return {
                id: a.adaptationSet.id || "__fake__" + this.globalId_++,
                contentType: a.adaptationSet.contentType,
                language: e,
                main: g,
                streams: k,
                drmInfos: u.drmInfos,
                trickModeFor: q,
                representationIds: f
            }
        };
        shaka.dash.DashParser.prototype.parseRepresentation_ = function(a, b, c, d, e, f, g, h, k) {
            var l = shaka.util.XmlUtils,
                m = shaka.util.ManifestParserUtils.ContentType;
            a.representation = this.createFrame_(k, a.adaptationSet, null);
            if (!this.verifyRepresentation_(a.representation)) return shaka.log.warning("Skipping Representation", a.representation), null;
            a.bandwidth = l.parseAttr(k, "bandwidth", l.parsePositiveInt) || 0;
            var n = a.representation.contentType;
            m = n == m.TEXT || n == m.APPLICATION;
            try {
                var q = this.requestInitSegment_.bind(this);
                if (a.representation.segmentBase) var p = shaka.dash.SegmentBase.createStream(a, q);
                else if (a.representation.segmentList) p = shaka.dash.SegmentList.createStream(a, this.segmentIndexMap_);
                else if (a.representation.segmentTemplate) p = shaka.dash.SegmentTemplate.createStream(a, q, this.segmentIndexMap_, !!this.manifest_);
                else {
                    goog.asserts.assert(m, "Must have Segment* with non-text streams.");
                    var t = a.representation.baseUris,
                        r = a.periodInfo.duration || 0;
                    p = {
                        createSegmentIndex: Promise.resolve.bind(Promise),
                        findSegmentPosition: function(a) {
                            return 0 <=
                                a && a < r ? 1 : null
                        },
                        getSegmentReference: function(a) {
                            return 1 != a ? null : new shaka.media.SegmentReference(1, 0, r, function() {
                                return t
                            }, 0, null)
                        },
                        initSegmentReference: null,
                        scaledPresentationTimeOffset: 0
                    }
                }
            } catch (v) {
                if (m && v.code == shaka.util.Error.Code.DASH_NO_SEGMENT_INFO) return null;
                throw v;
            }
            k = l.findChildren(k, "ContentProtection");
            k = shaka.dash.ContentProtection.parseFromRepresentation(k, this.config_.dash.customScheme, b, this.config_.dash.ignoreDrmInfo);
            return {
                id: this.globalId_++,
                originalId: a.representation.id,
                createSegmentIndex: p.createSegmentIndex,
                findSegmentPosition: p.findSegmentPosition,
                getSegmentReference: p.getSegmentReference,
                initSegmentReference: p.initSegmentReference,
                presentationTimeOffset: p.scaledPresentationTimeOffset,
                mimeType: a.representation.mimeType,
                codecs: a.representation.codecs,
                frameRate: a.representation.frameRate,
                pixelAspectRatio: a.representation.pixelAspectRatio,
                bandwidth: a.bandwidth,
                width: a.representation.width,
                height: a.representation.height,
                kind: c,
                encrypted: 0 < b.drmInfos.length,
                keyId: k,
                language: d,
                label: e,
                type: a.adaptationSet.contentType,
                primary: f,
                trickModeVideo: null,
                emsgSchemeIdUris: a.representation.emsgSchemeIdUris,
                roles: g,
                channelsCount: a.representation.numChannels,
                audioSamplingRate: a.representation.audioSamplingRate,
                closedCaptions: h
            }
        };
        shaka.dash.DashParser.prototype.onUpdate_ = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return goog.asserts.assert(0 <= a.updatePeriod_, "There should be an update period"), shaka.log.info("Updating manifest..."), d = 0, c.setCatchFinallyBlocks(2), c.yield(a.requestManifest_(), 4);
                        case 4:
                            d = c.yieldResult;
                            c.leaveTryBlock(3);
                            break;
                        case 2:
                            e = c.enterCatchBlock(), goog.asserts.assert(e instanceof shaka.util.Error, "Should only receive a Shaka error"), a.playerInterface_ && (e.severity = shaka.util.Error.Severity.RECOVERABLE, a.playerInterface_.onError(e));
                        case 3:
                            if (!a.playerInterface_) return c["return"]();
                            a.setUpdateTimer_(d);
                            c.jumpToEnd()
                    }
                })
            })
        };
        shaka.dash.DashParser.prototype.setUpdateTimer_ = function(a) {
            0 > this.updatePeriod_ || (a = Math.max(shaka.dash.DashParser.MIN_UPDATE_PERIOD_, this.updatePeriod_ - a, this.averageUpdateDuration_.getEstimate()), this.updateTimer_.tickAfter(a))
        };
        shaka.dash.DashParser.prototype.createFrame_ = function(a, b, c) {
            goog.asserts.assert(b || c, "Must provide either parent or baseUris");
            var d = shaka.util.ManifestParserUtils,
                e = shaka.util.XmlUtils;
            b = b || {
                contentType: "",
                mimeType: "",
                codecs: "",
                emsgSchemeIdUris: [],
                frameRate: void 0,
                numChannels: null,
                audioSamplingRate: null
            };
            c = c || b.baseUris;
            var f = e.parseNonNegativeInt,
                g = e.evalDivision,
                h = e.findChildren(a, "BaseURL").map(e.getContents),
                k = a.getAttribute("contentType") || b.contentType,
                l = a.getAttribute("mimeType") || b.mimeType,
                m = a.getAttribute("codecs") || b.codecs;
            g = e.parseAttr(a, "frameRate", g) || b.frameRate;
            var n = a.getAttribute("sar") || b.pixelAspectRatio,
                q = this.emsgSchemeIdUris_(e.findChildren(a, "InbandEventStream"), b.emsgSchemeIdUris),
                p = e.findChildren(a, "AudioChannelConfiguration");
            p = this.parseAudioChannels_(p) || b.numChannels;
            var t = e.parseAttr(a, "audioSamplingRate", f) || b.audioSamplingRate;
            k || (k = shaka.dash.DashParser.guessContentType_(l, m));
            return {
                baseUris: d.resolveUris(c, h),
                segmentBase: e.findChild(a, "SegmentBase") || b.segmentBase,
                segmentList: e.findChild(a, "SegmentList") || b.segmentList,
                segmentTemplate: e.findChild(a, "SegmentTemplate") || b.segmentTemplate,
                width: e.parseAttr(a, "width", f) || b.width,
                height: e.parseAttr(a, "height", f) || b.height,
                contentType: k,
                mimeType: l,
                codecs: m,
                frameRate: g,
                pixelAspectRatio: n,
                emsgSchemeIdUris: q,
                id: a.getAttribute("id"),
                numChannels: p,
                audioSamplingRate: t
            }
        };
        shaka.dash.DashParser.prototype.emsgSchemeIdUris_ = function(a, b) {
            for (var c = b.slice(), d = $jscomp.makeIterator(a), e = d.next(); !e.done; e = d.next()) e = e.value.getAttribute("schemeIdUri"), c.includes(e) || c.push(e);
            return c
        };
        shaka.dash.DashParser.prototype.parseAudioChannels_ = function(a) {
            for (var b = 0; b < a.length; ++b) {
                var c = a[b],
                    d = c.getAttribute("schemeIdUri");
                if (d && (c = c.getAttribute("value"))) switch (d) {
                    case "urn:mpeg:dash:outputChannelPositionList:2012":
                        return c.trim().split(/ +/).length;
                    case "urn:mpeg:dash:23003:3:audio_channel_configuration:2011":
                    case "urn:dts:dash:audio_channel_configuration:2012":
                        var e = parseInt(c, 10);
                        if (!e) {
                            shaka.log.warning("Channel parsing failure! Ignoring scheme and value", d, c);
                            continue
                        }
                        return e;
                    case "tag:dolby.com,2014:dash:audio_channel_configuration:2011":
                    case "urn:dolby:dash:audio_channel_configuration:2011":
                        e = parseInt(c, 16);
                        if (!e) {
                            shaka.log.warning("Channel parsing failure! Ignoring scheme and value", d, c);
                            continue
                        }
                        for (a = 0; e;) e & 1 && ++a, e >>= 1;
                        return a;
                    default:
                        shaka.log.warning("Unrecognized audio channel scheme:", d, c)
                }
            }
            return null
        };
        shaka.dash.DashParser.prototype.verifyRepresentation_ = function(a) {
            var b = shaka.util.ManifestParserUtils.ContentType;
            var c = a.segmentBase ? 1 : 0;
            c += a.segmentList ? 1 : 0;
            c += a.segmentTemplate ? 1 : 0;
            if (0 == c) {
                if (a.contentType == b.TEXT || a.contentType == b.APPLICATION) return !0;
                shaka.log.warning("Representation does not contain a segment information source:", "the Representation must contain one of SegmentBase, SegmentList,", 'SegmentTemplate, or explicitly indicate that it is "text".', a);
                return !1
            }
            1 != c && (shaka.log.warning("Representation contains multiple segment information sources:",
                "the Representation should only contain one of SegmentBase,", "SegmentList, or SegmentTemplate.", a), a.segmentBase ? (shaka.log.info("Using SegmentBase by default."), a.segmentList = null) : (goog.asserts.assert(a.segmentList, "There should be a SegmentList"), shaka.log.info("Using SegmentList by default.")), a.segmentTemplate = null);
            return !0
        };
        shaka.dash.DashParser.prototype.requestForTiming_ = function(a, b, c) {
            a = shaka.util.ManifestParserUtils.resolveUris(a, [b]);
            a = shaka.net.NetworkingEngine.makeRequest(a, this.config_.retryParameters);
            a.method = c;
            a = this.playerInterface_.networkingEngine.request(shaka.net.NetworkingEngine.RequestType.TIMING, a);
            this.operationManager_.manage(a);
            return a.promise.then(function(a) {
                if ("HEAD" == c) {
                    if (!a.headers || !a.headers.date) return shaka.log.warning("UTC timing response is missing", "expected date header"), 0;
                    a = a.headers.date
                } else a =
                    shaka.util.StringUtils.fromUTF8(a.data);
                a = Date.parse(a);
                return isNaN(a) ? (shaka.log.warning("Unable to parse date from UTC timing response"), 0) : a - Date.now()
            })
        };
        shaka.dash.DashParser.prototype.parseUtcTiming_ = function(a, b) {
            var c = b.map(function(a) {
                    return {
                        scheme: a.getAttribute("schemeIdUri"),
                        value: a.getAttribute("value")
                    }
                }),
                d = this.config_.dash.clockSyncUri;
            !c.length && d && c.push({
                scheme: "urn:mpeg:dash:utc:http-head:2014",
                value: d
            });
            return shaka.util.Functional.createFallbackPromiseChain(c, function(b) {
                var c = b.scheme;
                b = b.value;
                switch (c) {
                    case "urn:mpeg:dash:utc:http-head:2014":
                    case "urn:mpeg:dash:utc:http-head:2012":
                        return this.requestForTiming_(a, b, "HEAD");
                    case "urn:mpeg:dash:utc:http-xsdate:2014":
                    case "urn:mpeg:dash:utc:http-iso:2014":
                    case "urn:mpeg:dash:utc:http-xsdate:2012":
                    case "urn:mpeg:dash:utc:http-iso:2012":
                        return this.requestForTiming_(a,
                            b, "GET");
                    case "urn:mpeg:dash:utc:direct:2014":
                    case "urn:mpeg:dash:utc:direct:2012":
                        return c = Date.parse(b), isNaN(c) ? 0 : c - Date.now();
                    case "urn:mpeg:dash:utc:http-ntp:2014":
                    case "urn:mpeg:dash:utc:ntp:2014":
                    case "urn:mpeg:dash:utc:sntp:2014":
                        return shaka.log.alwaysWarn("NTP UTCTiming scheme is not supported"), Promise.reject();
                    default:
                        return shaka.log.alwaysWarn("Unrecognized scheme in UTCTiming element", c), Promise.reject()
                }
            }.bind(this))["catch"](function() {
                shaka.log.alwaysWarn("A UTCTiming element should always be given in live manifests! This content may not play on clients with bad clocks!");
                return 0
            })
        };
        shaka.dash.DashParser.prototype.parseEventStream_ = function(a, b, c) {
            var d = shaka.util.XmlUtils,
                e = d.parseNonNegativeInt,
                f = c.getAttribute("schemeIdUri") || "",
                g = c.getAttribute("value") || "",
                h = d.parseAttr(c, "timescale", e) || 1;
            d.findChildren(c, "Event").forEach(function(c) {
                var k = d.parseAttr(c, "presentationTime", e) || 0,
                    m = d.parseAttr(c, "duration", e) || 0;
                k = k / h + a;
                m = k + m / h;
                null != b && (k = Math.min(k, a + b), m = Math.min(m, a + b));
                c = {
                    schemeIdUri: f,
                    value: g,
                    startTime: k,
                    endTime: m,
                    id: c.getAttribute("id") || "",
                    eventElement: c
                };
                this.playerInterface_.onTimelineRegionAdded(c)
            }.bind(this))
        };
        shaka.dash.DashParser.prototype.requestInitSegment_ = function(a, b, c) {
            var d = shaka.net.NetworkingEngine.RequestType.SEGMENT;
            a = shaka.util.Networking.createSegmentRequest(a, b, c, this.config_.retryParameters);
            d = this.playerInterface_.networkingEngine.request(d, a);
            this.operationManager_.manage(d);
            return d.promise.then(function(a) {
                return a.data
            })
        };
        shaka.dash.DashParser.guessContentType_ = function(a, b) {
            var c = shaka.util.MimeUtils.getFullType(a, b);
            return shaka.text.TextEngine.isTypeSupported(c) ? shaka.util.ManifestParserUtils.ContentType.TEXT : a.split("/")[0]
        };
        shaka.media.ManifestParser.registerParserByExtension("mpd", shaka.dash.DashParser);
        shaka.media.ManifestParser.registerParserByMime("application/dash+xml", shaka.dash.DashParser);
        shaka.media.ManifestParser.registerParserByMime("video/vnd.mpeg.dash.mpd", shaka.dash.DashParser);
        shaka.hls = {};
        shaka.hls.Playlist = function(a, b, c, d) {
            this.absoluteUri = a;
            this.type = b;
            this.tags = c;
            this.segments = d || null
        };
        shaka.hls.PlaylistType = {
            MASTER: 0,
            MEDIA: 1
        };
        shaka.hls.Tag = function(a, b, c, d) {
            this.id = a;
            this.name = b;
            this.attributes = c;
            this.value = void 0 === d ? null : d
        };
        shaka.hls.Tag.prototype.toString = function() {
            var a = function(a) {
                    var b = isNaN(Number(a.value)) ? '"' + a.value + '"' : a.value;
                    return a.name + "=" + b
                },
                b = "#" + this.name;
            a = this.attributes ? this.attributes.map(a) : [];
            this.value && a.unshift(this.value);
            0 < a.length && (b += ":" + a.join(","));
            return b
        };
        shaka.hls.Attribute = function(a, b) {
            this.name = a;
            this.value = b
        };
        shaka.hls.Tag.prototype.addAttribute = function(a) {
            this.attributes.push(a)
        };
        shaka.hls.Tag.prototype.getAttribute = function(a) {
            var b = this.attributes.filter(function(b) {
                return b.name == a
            });
            goog.asserts.assert(2 > b.length, "A tag should not have multiple attributes with the same name!");
            return b.length ? b[0] : null
        };
        shaka.hls.Tag.prototype.getAttributeValue = function(a, b) {
            var c = this.getAttribute(a);
            return c ? c.value : b || null
        };
        shaka.hls.Segment = function(a, b) {
            this.tags = b;
            this.absoluteUri = a
        };
        shaka.hls.Utils = {};
        shaka.hls.Utils.filterTagsByName = function(a, b) {
            return a.filter(function(a) {
                return a.name == b
            })
        };
        shaka.hls.Utils.getFirstTagWithName = function(a, b) {
            var c = shaka.hls.Utils.filterTagsByName(a, b);
            return c.length ? c[0] : null
        };
        shaka.hls.Utils.findMediaTags = function(a, b, c) {
            return a.filter(function(a) {
                var d = a.getAttribute("TYPE");
                a = a.getAttribute("GROUP-ID");
                return d.value == b && a.value == c
            })
        };
        shaka.hls.Utils.constructAbsoluteUri = function(a, b) {
            return shaka.util.ManifestParserUtils.resolveUris([a], [b])[0]
        };
        shaka.hls.Utils.isComment = function(a) {
            return /^#(?!EXT)/m.test(a)
        };
        shaka.util.TextParser = function(a) {
            this.data_ = a;
            this.position_ = 0
        };
        shaka.util.TextParser.prototype.atEnd = function() {
            return this.position_ == this.data_.length
        };
        shaka.util.TextParser.prototype.readLine = function() {
            return this.readRegexReturnCapture_(/(.*?)(\n|$)/gm, 1)
        };
        shaka.util.TextParser.prototype.readWord = function() {
            return this.readRegexReturnCapture_(/[^ \t\n]*/gm, 0)
        };
        shaka.util.TextParser.prototype.skipWhitespace = function() {
            this.readRegex(/[ \t]+/gm)
        };
        shaka.util.TextParser.prototype.readRegex = function(a) {
            a = this.indexOf_(a);
            if (this.atEnd() || null == a || a.position != this.position_) return null;
            this.position_ += a.length;
            return a.results
        };
        shaka.util.TextParser.prototype.readRegexReturnCapture_ = function(a, b) {
            if (this.atEnd()) return null;
            var c = this.readRegex(a);
            return c ? c[b] : null
        };
        shaka.util.TextParser.prototype.indexOf_ = function(a) {
            goog.asserts.assert(a.global, "global flag should be set");
            a.lastIndex = this.position_;
            a = a.exec(this.data_);
            return null == a ? null : {
                position: a.index,
                length: a[0].length,
                results: a
            }
        };
        shaka.hls.ManifestTextParser = function() {
            this.globalId_ = 0
        };
        shaka.hls.ManifestTextParser.prototype.parsePlaylist = function(a, b) {
            var c = shaka.hls.ManifestTextParser.MEDIA_PLAYLIST_TAGS,
                d = shaka.hls.ManifestTextParser.SEGMENT_TAGS,
                e = shaka.util.StringUtils.fromUTF8(a);
            e = e.replace(/\r\n|\r(?=[^\n]|$)/gm, "\n").trim();
            var f = e.split(/\n+/m);
            if (!/^#EXTM3U($|[ \t\n])/m.test(f[0])) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_PLAYLIST_HEADER_MISSING);
            e = shaka.hls.PlaylistType.MASTER;
            for (var g =
                    1; g < f.length; g++)
                if (!shaka.hls.Utils.isComment(f[g])) {
                    var h = this.parseTag_(f[g]);
                    --this.globalId_;
                    if (c.includes(h.name)) {
                        e = shaka.hls.PlaylistType.MEDIA;
                        break
                    } else "EXT-X-STREAM-INF" == h.name && (g += 1)
                } c = [];
            for (g = 1; g < f.length;)
                if (shaka.hls.Utils.isComment(f[g])) g += 1;
                else {
                    h = this.parseTag_(f[g]);
                    if (d.includes(h.name)) {
                        if (e != shaka.hls.PlaylistType.MEDIA) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_INVALID_PLAYLIST_HIERARCHY);
                        d =
                            f.splice(g, f.length - g);
                        d = this.parseSegments_(b, d, c);
                        return new shaka.hls.Playlist(b, e, c, d)
                    }
                    c.push(h);
                    g += 1;
                    if ("EXT-X-STREAM-INF" == h.name) {
                        var k = new shaka.hls.Attribute("URI", f[g]);
                        h.addAttribute(k);
                        g += 1
                    }
                } return new shaka.hls.Playlist(b, e, c)
        };
        shaka.hls.ManifestTextParser.prototype.parseSegments_ = function(a, b, c) {
            var d = this,
                e = [],
                f = [];
            b.forEach(function(b) {
                if (/^(#EXT)/.test(b)) b = d.parseTag_(b), shaka.hls.ManifestTextParser.MEDIA_PLAYLIST_TAGS.includes(b.name) ? c.push(b) : f.push(b);
                else {
                    if (shaka.hls.Utils.isComment(b)) return [];
                    b = b.trim();
                    b = shaka.hls.Utils.constructAbsoluteUri(a, b);
                    b = new shaka.hls.Segment(b, f);
                    e.push(b);
                    f = []
                }
            });
            return e
        };
        shaka.hls.ManifestTextParser.prototype.parseTag_ = function(a) {
            return shaka.hls.ManifestTextParser.parseTag(this.globalId_++, a)
        };
        shaka.hls.ManifestTextParser.parseTag = function(a, b) {
            var c = b.match(/^#(EXT[^:]*)(?::(.*))?$/);
            if (!c) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.INVALID_HLS_TAG, b);
            var d = c[1],
                e = c[2];
            c = [];
            var f;
            if (e) {
                e = new shaka.util.TextParser(e);
                var g, h = e.readRegex(/^([^,=]+)(?:,|$)/g);
                h && (f = h[1]);
                for (h = /([^=]+)=(?:"([^"]*)"|([^",]*))(?:,|$)/g; g = e.readRegex(h);) g = new shaka.hls.Attribute(g[1], g[2] || g[3]), c.push(g)
            }
            return new shaka.hls.Tag(a,
                d, c, f)
        };
        shaka.hls.ManifestTextParser.MEDIA_PLAYLIST_TAGS = "EXT-X-TARGETDURATION EXT-X-MEDIA-SEQUENCE EXT-X-DISCONTINUITY-SEQUENCE EXT-X-PLAYLIST-TYPE EXT-X-MAP EXT-X-I-FRAMES-ONLY EXT-X-ENDLIST".split(" ");
        shaka.hls.ManifestTextParser.SEGMENT_TAGS = "EXTINF EXT-X-BYTERANGE EXT-X-DISCONTINUITY EXT-X-PROGRAM-DATE-TIME EXT-X-KEY EXT-X-DATERANGE".split(" ");
        shaka.net.DataUriPlugin = function(a, b, c, d) {
            try {
                var e = shaka.net.DataUriPlugin.parse(a);
                return shaka.util.AbortableOperation.completed({
                    uri: a,
                    originalUri: a,
                    data: e.data,
                    headers: {
                        "content-type": e.contentType
                    }
                })
            } catch (f) {
                return shaka.util.AbortableOperation.failed(f)
            }
        };
        goog.exportSymbol("shaka.net.DataUriPlugin", shaka.net.DataUriPlugin);
        shaka.net.DataUriPlugin.parse = function(a) {
            var b = a.split(":");
            if (2 > b.length || "data" != b[0]) throw shaka.log.error("Bad data URI, failed to parse scheme"), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.MALFORMED_DATA_URI, a);
            b = b.slice(1).join(":").split(",");
            if (2 > b.length) throw shaka.log.error("Bad data URI, failed to extract encoding and MIME type"), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.NETWORK,
                shaka.util.Error.Code.MALFORMED_DATA_URI, a);
            var c = b[0];
            a = window.decodeURIComponent(b.slice(1).join(","));
            b = c.split(";");
            c = b[0];
            var d = !1;
            1 < b.length && "base64" == b[b.length - 1] && (d = !0, b.pop());
            return {
                data: d ? shaka.util.Uint8ArrayUtils.fromBase64(a).buffer : shaka.util.StringUtils.toUTF8(a),
                contentType: c
            }
        };
        shaka.net.NetworkingEngine.registerScheme("data", shaka.net.DataUriPlugin);
        shaka.hls.HlsParser = function() {
            var a = this;
            this.config_ = this.playerInterface_ = null;
            this.globalId_ = 1;
            this.mediaTagsToStreamInfosMap_ = new Map;
            this.variantUriSet_ = new Set;
            this.uriToStreamInfosMap_ = new Map;
            this.presentationTimeline_ = null;
            this.masterPlaylistUri_ = "";
            this.manifestTextParser_ = new shaka.hls.ManifestTextParser;
            this.updatePlaylistDelay_ = 0;
            this.updatePlaylistTimer_ = new shaka.util.Timer(function() {
                a.onUpdate_()
            });
            this.presentationType_ = shaka.hls.HlsParser.PresentationType_.VOD;
            this.manifest_ = null;
            this.maxTargetDuration_ = 0;
            this.minTargetDuration_ = Infinity;
            this.operationManager_ = new shaka.util.OperationManager;
            this.segmentsToNotifyByStream_ = [];
            this.groupIdToClosedCaptionsMap_ = new Map;
            this.aesEncrypted_ = !1
        };
        goog.exportSymbol("shaka.hls.HlsParser", shaka.hls.HlsParser);
        shaka.hls.HlsParser.prototype.configure = function(a) {
            this.config_ = a
        };
        shaka.hls.HlsParser.prototype.start = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return goog.asserts.assert(c.config_, "Must call configure() before start()!"), c.playerInterface_ = b, e.yield(c.requestManifest_(a), 2);
                        case 2:
                            return f = e.yieldResult, c.masterPlaylistUri_ = f.uri, goog.asserts.assert(f.data, "Response data should be non-null!"), e.yield(c.parseManifest_(f.data),
                                3);
                        case 3:
                            return g = c.updatePlaylistDelay_, 0 < g && c.updatePlaylistTimer_.tickAfter(g), goog.asserts.assert(c.manifest_, "Manifest should be non-null"), e["return"](c.manifest_)
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.stop = function() {
            this.updatePlaylistTimer_ && (this.updatePlaylistTimer_.stop(), this.updatePlaylistTimer_ = null);
            var a = [];
            this.operationManager_ && (a.push(this.operationManager_.destroy()), this.operationManager_ = null);
            this.config_ = this.playerInterface_ = null;
            this.mediaTagsToStreamInfosMap_.clear();
            this.variantUriSet_.clear();
            this.uriToStreamInfosMap_.clear();
            this.manifest_ = null;
            return Promise.all(a)
        };
        shaka.hls.HlsParser.prototype.update = function() {
            if (this.isLive_()) {
                for (var a = [], b = $jscomp.makeIterator(this.uriToStreamInfosMap_.values()), c = b.next(); !c.done; c = b.next()) a.push(this.updateStream_(c.value));
                return Promise.all(a)
            }
        };
        shaka.hls.HlsParser.prototype.updateStream_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l, m, n, q, p, t;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return e = shaka.hls.Utils, f = shaka.hls.HlsParser.PresentationType_, g = a.absoluteMediaPlaylistUri, d.yield(b.requestManifest_(g), 2);
                        case 2:
                            h = d.yieldResult;
                            k = b.manifestTextParser_.parsePlaylist(h.data, h.uri);
                            if (k.type != shaka.hls.PlaylistType.MEDIA) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                                shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_INVALID_PLAYLIST_HIERARCHY);
                            m = (l = e.getFirstTagWithName(k.tags, "EXT-X-MEDIA-SEQUENCE")) ? Number(l.value) : 0;
                            n = a.stream;
                            return d.yield(b.createSegments_(a.verbatimMediaPlaylistUri, k, m, n.mimeType, n.codecs), 3);
                        case 3:
                            q = d.yieldResult;
                            a.segmentIndex.replace(q);
                            p = q[q.length - 1];
                            goog.asserts.assert(p, "Should have segments!");
                            if (t = e.getFirstTagWithName(k.tags, "EXT-X-ENDLIST")) b.setPresentationType_(f.VOD), b.presentationTimeline_.setDuration(p.endTime);
                            d.jumpToEnd()
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.onExpirationUpdated = function(a, b) {};
        shaka.hls.HlsParser.prototype.parseManifest_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l, m, n, q, p, t, r, v;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            goog.asserts.assert(b.masterPlaylistUri_, "Master playlist URI must be set before calling parseManifest_!");
                            e = b.manifestTextParser_.parsePlaylist(a, b.masterPlaylistUri_);
                            if (e.type != shaka.hls.PlaylistType.MASTER) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                                shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_MASTER_PLAYLIST_NOT_PROVIDED);
                            return d.yield(b.createPeriod_(e), 2);
                        case 2:
                            f = d.yieldResult;
                            if (!b.playerInterface_) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.OPERATION_ABORTED);
                            if (b.aesEncrypted_ && 0 == f.variants.length) throw shaka.log.info("No stream is created, because we don't support AES-128", "encryption yet"), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                                shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_AES_128_ENCRYPTION_NOT_SUPPORTED);
                            b.playerInterface_.filterAllPeriods([f]);
                            g = Infinity;
                            k = h = 0;
                            l = Infinity;
                            for (var u = $jscomp.makeIterator(b.uriToStreamInfosMap_.values()), w = u.next(); !w.done; w = u.next()) m = w.value, g = Math.min(g, m.minTimestamp), h = Math.max(h, m.minTimestamp), k = Math.max(k, m.maxTimestamp), "text" != m.stream.type && (l = Math.min(l, m.duration));
                            goog.asserts.assert(null == b.presentationTimeline_, "Presentation timeline created early!");
                            b.createPresentationTimeline_(k);
                            goog.asserts.assert(b.presentationTimeline_, "Presentation timeline not created!");
                            if (b.isLive_()) {
                                b.updatePlaylistDelay_ = b.minTargetDuration_;
                                n = shaka.hls.HlsParser.PresentationType_;
                                b.presentationType_ == n.LIVE && (q = b.presentationTimeline_.getDelay(), isNaN(b.config_.availabilityWindowOverride) || (q = b.config_.availabilityWindowOverride), b.presentationTimeline_.setSegmentAvailabilityDuration(q));
                                p = shaka.hls.HlsParser.TS_ROLLOVER_ / shaka.hls.HlsParser.TS_TIMESCALE_;
                                for (t = 0; h >= p;) t += p, h -= p;
                                if (t)
                                    for (shaka.log.debug("Offsetting live streams by",
                                            t, "to compensate for rollover"), u = $jscomp.makeIterator(b.uriToStreamInfosMap_.values()), w = u.next(); !w.done; w = u.next()) r = w.value, r.minTimestamp < p ? (shaka.log.v1("Offset applied to", r.stream.type), r.stream.presentationTimeOffset = -t, r.segmentIndex.offset(t)) : shaka.log.v1("Offset NOT applied to", r.stream.type)
                            } else
                                for (b.presentationTimeline_.setDuration(l), b.presentationTimeline_.offset(-g), u = $jscomp.makeIterator(b.uriToStreamInfosMap_.values()), w = u.next(); !w.done; w = u.next()) v = w.value, v.stream.presentationTimeOffset =
                                    g, v.segmentIndex.offset(-g), v.segmentIndex.fit(l);
                            b.manifest_ = {
                                presentationTimeline: b.presentationTimeline_,
                                periods: [f],
                                offlineSessionIds: [],
                                minBufferTime: 0
                            };
                            d.jumpToEnd()
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.createPeriod_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l, m, n, q, p, t, r;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return e = shaka.hls.Utils, f = shaka.util.Functional, g = a.tags, h = e.filterTagsByName(a.tags, "EXT-X-MEDIA"), k = h.filter(function(a) {
                                return "SUBTITLES" == shaka.hls.HlsParser.getRequiredAttributeValue_(a, "TYPE")
                            }.bind(b)), l = k.map(function(b) {
                                var d = this;
                                return $jscomp.asyncExecutePromiseGeneratorFunction(function x() {
                                    var e;
                                    return $jscomp.generator.createGenerator(x, function(f) {
                                        switch (f.nextAddress) {
                                            case 1:
                                                if (d.config_.disableText) return f["return"](null);
                                                f.setCatchFinallyBlocks(2);
                                                return f.yield(d.createTextStream_(b, a), 4);
                                            case 4:
                                                return f["return"](f.yieldResult);
                                            case 2:
                                                e = f.enterCatchBlock();
                                                if (d.config_.hls.ignoreTextStreamFailures) return f["return"](null);
                                                throw e;
                                        }
                                    })
                                })
                            }.bind(b)), m = h.filter(function(a) {
                                return "CLOSED-CAPTIONS" == shaka.hls.HlsParser.getRequiredAttributeValue_(a, "TYPE")
                            }), b.parseClosedCaptions_(m), d.yield(Promise.all(l),
                                2);
                        case 2:
                            return n = d.yieldResult, q = e.filterTagsByName(g, "EXT-X-STREAM-INF"), p = q.map(function(b) {
                                return this.createVariantsForTag_(b, a)
                            }.bind(b)), d.yield(Promise.all(p), 3);
                        case 3:
                            return t = d.yieldResult, r = t.reduce(f.collapseArrays, []), r = r.filter(function(a) {
                                return null != a
                            }), d["return"]({
                                startTime: 0,
                                variants: r,
                                textStreams: n.filter(function(a) {
                                    return null != a
                                })
                            })
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.createVariantsForTag_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l, m, n, q, p, t, r, v, u, y, w, x, G, D, H, C, z, A, E, F, B, I, K, L, N;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            goog.asserts.assert("EXT-X-STREAM-INF" == a.name, "Should only be called on variant tags!");
                            f = shaka.util.ManifestParserUtils.ContentType;
                            g = shaka.hls.Utils;
                            h = [];
                            c.config_.disableVideo || h.push("avc1.42E01E");
                            c.config_.disableAudio ||
                                h.push("mp4a.40.2");
                            k = h.join(",");
                            l = a.getAttributeValue("CODECS", k);
                            m = shaka.hls.HlsParser.filterDuplicateCodecs_(l.split(/\s*,\s*/));
                            n = a.getAttribute("RESOLUTION");
                            p = q = null;
                            t = a.getAttributeValue("FRAME-RATE");
                            r = Number(shaka.hls.HlsParser.getRequiredAttributeValue_(a, "BANDWIDTH"));
                            n && (v = n.value.split("x"), q = v[0], p = v[1]);
                            u = g.filterTagsByName(b.tags, "EXT-X-MEDIA");
                            u = u.filter(function(a) {
                                return "CLOSED-CAPTIONS" != shaka.hls.HlsParser.getRequiredAttributeValue_(a, "TYPE")
                            });
                            u = u.filter(function(a) {
                                var b = a.getAttributeValue("URI") ||
                                    "";
                                return "SUBTITLES" == (a.getAttributeValue("TYPE") || "") || "" != b
                            });
                            y = a.getAttributeValue("AUDIO");
                            w = a.getAttributeValue("VIDEO");
                            goog.asserts.assert(null == y || null == w, "Unexpected: both video and audio described by media tags!");
                            y ? u = g.findMediaTags(u, "AUDIO", y) : w && (u = g.findMediaTags(u, "VIDEO", w));
                            if (x = c.guessCodecsSafe_(f.TEXT, m)) {
                                if (G = a.getAttributeValue("SUBTITLES"))
                                    if (D = g.findMediaTags(u, "SUBTITLES", G), goog.asserts.assert(1 == D.length, "Exactly one text tag expected!"), D.length && (H = c.mediaTagsToStreamInfosMap_.get(D[0].id))) H.stream.codecs =
                                        x;
                                shaka.util.ArrayUtils.remove(m, x)
                            }
                            C = u.map(function(a) {
                                return this.createStreamInfoFromMediaTag_(a, m)
                            }.bind(c));
                            z = [];
                            A = [];
                            return e.yield(Promise.all(C), 2);
                        case 2:
                            F = e.yieldResult;
                            F = F.filter(function(a) {
                                return null != a
                            });
                            y ? z = F : w && (A = F);
                            shaka.log.debug("Guessing stream type for", a.toString());
                            I = !1;
                            z.length || A.length ? z.length ? (L = shaka.hls.HlsParser.getRequiredAttributeValue_(a, "URI"), N = z[0].verbatimMediaPlaylistUri, L == N ? (shaka.log.debug("Guessing audio-only."), B = f.AUDIO, I = !0) : (shaka.log.debug("Guessing video."),
                                B = f.VIDEO)) : (goog.asserts.assert(A.length, "No video streams!  This should have been handled already!"), shaka.log.debug("Guessing audio."), B = f.AUDIO) : 1 == m.length ? (K = c.guessCodecsSafe_(f.VIDEO, m), n || t || K ? (shaka.log.debug("Guessing video-only."), B = f.VIDEO) : (shaka.log.debug("Guessing audio-only."), B = f.AUDIO)) : (shaka.log.debug("Guessing multiplexed audio+video."), B = f.VIDEO, m = [m.join(",")]);
                            goog.asserts.assert(B, "Type should have been set by now!");
                            if (I) {
                                e.jumpTo(3);
                                break
                            }
                            return e.yield(c.createStreamInfoFromVariantTag_(a,
                                m, B), 4);
                        case 4:
                            E = e.yieldResult;
                        case 3:
                            if (E) E.stream.type == f.AUDIO ? z = [E] : A = [E];
                            else if (null === E) return shaka.log.debug("streamInfo is null"), e["return"]([]);
                            goog.asserts.assert(A.length || z.length, "We should have created a stream!");
                            A && c.filterLegacyCodecs_(A);
                            z && c.filterLegacyCodecs_(z);
                            return e["return"](c.createVariants_(z, A, r, q, p, t))
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.filterLegacyCodecs_ = function(a) {
            a.forEach(function(a) {
                if (a) {
                    var b = a.stream.codecs.split(",");
                    b = b.filter(function(a) {
                        return "mp4a.40.34" != a
                    });
                    a.stream.codecs = b.join(",")
                }
            })
        };
        shaka.hls.HlsParser.prototype.createVariants_ = function(a, b, c, d, e, f) {
            var g = shaka.media.DrmEngine;
            b.forEach(function(a) {
                this.addVideoAttributes_(a.stream, d, e, f)
            }.bind(this));
            var h = this.config_ ? this.config_.disableAudio : !1;
            if (!a.length || h) a = [null];
            h = this.config_ ? this.config_.disableVideo : !1;
            if (!b.length || h) b = [null];
            h = [];
            a = $jscomp.makeIterator(a);
            for (var k = a.next(); !k.done; k = a.next()) {
                k = k.value;
                for (var l = $jscomp.makeIterator(b), m = l.next(); !m.done; m = l.next()) {
                    var n = m.value;
                    m = k ? k.stream : null;
                    var q = n ? n.stream :
                        null,
                        p = k ? k.drmInfos : null,
                        t = n ? n.drmInfos : null;
                    n = (n ? n.verbatimMediaPlaylistUri : "") + " - " + (k ? k.verbatimMediaPlaylistUri : "");
                    var r = void 0;
                    if (m && q)
                        if (g.areDrmCompatible(p, t)) r = g.getCommonDrmInfos(p, t);
                        else {
                            shaka.log.warning("Incompatible DRM info in HLS variant.  Skipping.");
                            continue
                        }
                    else m ? r = p : q && (r = t);
                    this.variantUriSet_.has(n) ? shaka.log.debug("Skipping variant which only differs in text streams.") : (m = this.createVariant_(m, q, c, r), h.push(m), this.variantUriSet_.add(n))
                }
            }
            return h
        };
        shaka.hls.HlsParser.prototype.createVariant_ = function(a, b, c, d) {
            var e = shaka.util.ManifestParserUtils.ContentType;
            goog.asserts.assert(!a || a.type == e.AUDIO, "Audio parameter mismatch!");
            goog.asserts.assert(!b || b.type == e.VIDEO, "Video parameter mismatch!");
            return {
                id: this.globalId_++,
                language: a ? a.language : "und",
                primary: !!a && a.primary || !!b && b.primary,
                audio: a,
                video: b,
                bandwidth: c,
                drmInfos: d,
                allowedByApplication: !0,
                allowedByKeySystem: !0
            }
        };
        shaka.hls.HlsParser.prototype.createTextStream_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var b, g;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return goog.asserts.assert("EXT-X-MEDIA" == a.name, "Should only be called on media tags!"), b = shaka.hls.HlsParser.getRequiredAttributeValue_(a, "TYPE"), goog.asserts.assert("SUBTITLES" == b, 'Should only be called on tags with TYPE="SUBTITLES"!'), e.yield(c.createStreamInfoFromMediaTag_(a,
                                []), 2);
                        case 2:
                            return g = e.yieldResult, goog.asserts.assert(g, "Should always have a streamInfo for text"), e["return"](g.stream)
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.parseClosedCaptions_ = function(a) {
            a = $jscomp.makeIterator(a);
            for (var b = a.next(); !b.done; b = a.next()) {
                b = b.value;
                goog.asserts.assert("EXT-X-MEDIA" == b.name, "Should only be called on media tags!");
                var c = shaka.hls.HlsParser.getRequiredAttributeValue_(b, "TYPE");
                goog.asserts.assert("CLOSED-CAPTIONS" == c, 'Should only be called on tags with TYPE="CLOSED-CAPTIONS"!');
                c = shaka.util.LanguageUtils;
                var d = b.getAttributeValue("LANGUAGE") || "und";
                c = c.normalize(d);
                d = shaka.hls.HlsParser.getRequiredAttributeValue_(b,
                    "GROUP-ID");
                b = shaka.hls.HlsParser.getRequiredAttributeValue_(b, "INSTREAM-ID");
                this.groupIdToClosedCaptionsMap_.get(d) || this.groupIdToClosedCaptionsMap_.set(d, new Map);
                this.groupIdToClosedCaptionsMap_.get(d).set(b, c)
            }
        };
        shaka.hls.HlsParser.prototype.createStreamInfoFromMediaTag_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l, m, n, q, p, t, r, v, u;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            goog.asserts.assert("EXT-X-MEDIA" == a.name, "Should only be called on media tags!");
                            f = shaka.hls.HlsParser;
                            g = f.getRequiredAttributeValue_(a, "URI");
                            if (c.uriToStreamInfosMap_.has(g)) return e["return"](c.uriToStreamInfosMap_.get(g));
                            h = f.getRequiredAttributeValue_(a,
                                "TYPE").toLowerCase();
                            k = shaka.util.ManifestParserUtils.ContentType;
                            "subtitles" == h && (h = k.TEXT);
                            l = shaka.util.LanguageUtils;
                            m = l.normalize(a.getAttributeValue("LANGUAGE", "und"));
                            n = a.getAttributeValue("NAME");
                            q = a.getAttribute("DEFAULT");
                            p = "YES" == q;
                            t = a.getAttributeValue("CHANNELS");
                            r = "audio" == h ? c.getChannelCount_(t) : null;
                            v = a.getAttributeValue("CHARACTERISTICS");
                            return e.yield(c.createStreamInfo_(g, b, h, m, p, n, r, null, v), 2);
                        case 2:
                            u = e.yieldResult;
                            if (c.uriToStreamInfosMap_.has(g)) return e["return"](c.uriToStreamInfosMap_.get(g));
                            if (null == u) return e["return"](null);
                            c.mediaTagsToStreamInfosMap_.set(a.id, u);
                            c.uriToStreamInfosMap_.set(g, u);
                            return e["return"](u)
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.getChannelCount_ = function(a) {
            if (!a) return null;
            a = a.split("/")[0];
            return parseInt(a, 10)
        };
        shaka.hls.HlsParser.prototype.createStreamInfoFromVariantTag_ = function(a, b, c) {
            var d = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                var g, h, k, l, m, n;
                return $jscomp.generator.createGenerator(f, function(f) {
                    switch (f.nextAddress) {
                        case 1:
                            goog.asserts.assert("EXT-X-STREAM-INF" == a.name, "Should only be called on media tags!");
                            g = shaka.util.ManifestParserUtils.ContentType;
                            h = shaka.hls.HlsParser;
                            k = h.getRequiredAttributeValue_(a, "URI");
                            if (d.uriToStreamInfosMap_.has(k)) return f["return"](d.uriToStreamInfosMap_.get(k));
                            l = a.getAttributeValue("CLOSED-CAPTIONS");
                            m = null;
                            c == g.VIDEO && l && "NONE" != l && (m = d.groupIdToClosedCaptionsMap_.get(l));
                            return f.yield(d.createStreamInfo_(k, b, c, "und", !1, null, null, m, null), 2);
                        case 2:
                            n = f.yieldResult;
                            if (null == n) return f["return"](null);
                            if (d.uriToStreamInfosMap_.has(k)) return f["return"](d.uriToStreamInfosMap_.get(k));
                            d.uriToStreamInfosMap_.set(k, n);
                            return f["return"](n)
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.createStreamInfo_ = function(a, b, c, d, e, f, g, h, k) {
            var l = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function n() {
                var q, p, t, r, v, u, y, w, x, G, D, H, C, z, A, E, F, B, I, K, L, N, M, R, P, Q, S, T;
                return $jscomp.generator.createGenerator(n, function(n) {
                    switch (n.nextAddress) {
                        case 1:
                            return q = shaka.hls.Utils, p = q.constructAbsoluteUri(l.masterPlaylistUri_, a), n.yield(l.requestManifest_(p), 2);
                        case 2:
                            t = n.yieldResult;
                            p = t.uri;
                            r = l.manifestTextParser_.parsePlaylist(t.data, p);
                            if (r.type != shaka.hls.PlaylistType.MEDIA) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                                shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_INVALID_PLAYLIST_HIERARCHY);
                            v = [];
                            r.segments.forEach(function(a) {
                                a = q.filterTagsByName(a.tags, "EXT-X-KEY");
                                v.push.apply(v, a)
                            });
                            u = !1;
                            y = [];
                            w = null;
                            for (var O = $jscomp.makeIterator(v), J = O.next(); !J.done; J = O.next())
                                if (x = J.value, G = shaka.hls.HlsParser.getRequiredAttributeValue_(x, "METHOD"), "NONE" != G) {
                                    u = !0;
                                    if ("AES-128" == G) return shaka.log.warning("Unsupported HLS Encryption", G), l.aesEncrypted_ = !0, n["return"](null);
                                    D = shaka.hls.HlsParser.getRequiredAttributeValue_(x,
                                        "KEYFORMAT");
                                    (C = (H = shaka.hls.HlsParser.KEYFORMATS_TO_DRM_PARSERS_[D]) ? H(x) : null) ? (C.keyIds.length && (w = C.keyIds[0]), y.push(C)) : shaka.log.warning("Unsupported HLS KEYFORMAT", D)
                                } if (u && !y.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_KEYFORMATS_NOT_SUPPORTED);
                            goog.asserts.assert(null != r.segments, "Media playlist should have segments!");
                            l.determinePresentationType_(r);
                            z = l.guessCodecs_(c, b);
                            return n.yield(l.guessMimeType_(c,
                                z, r), 3);
                        case 3:
                            return A = n.yieldResult, shaka.hls.HlsParser.RAW_FORMATS_.includes(A) && (z = ""), F = (E = q.getFirstTagWithName(r.tags, "EXT-X-MEDIA-SEQUENCE")) ? Number(E.value) : 0, n.setCatchFinallyBlocks(4), n.yield(l.createSegments_(a, r, F, A, z), 6);
                        case 6:
                            B = n.yieldResult;
                            n.leaveTryBlock(5);
                            break;
                        case 4:
                            I = n.enterCatchBlock();
                            if (I.code == shaka.util.Error.Code.HLS_INTERNAL_SKIP_STREAM) return shaka.log.alwaysWarn("Skipping unsupported HLS stream", A, a), n["return"](null);
                            throw I;
                        case 5:
                            K = B[0].startTime;
                            L = B[B.length - 1].endTime;
                            N = L - K;
                            M = new shaka.media.SegmentIndex(B);
                            R = l.createInitSegmentReference_(r);
                            P = void 0;
                            c == shaka.util.ManifestParserUtils.ContentType.TEXT && (P = shaka.util.ManifestParserUtils.TextStreamKind.SUBTITLE);
                            Q = [];
                            if (k)
                                for (O = $jscomp.makeIterator(k.split(",")), J = O.next(); !J.done; J = O.next()) S = J.value, Q.push(S);
                            T = {
                                id: l.globalId_++,
                                originalId: f,
                                createSegmentIndex: Promise.resolve.bind(Promise),
                                findSegmentPosition: M.find.bind(M),
                                getSegmentReference: M.get.bind(M),
                                initSegmentReference: R,
                                presentationTimeOffset: 0,
                                mimeType: A,
                                codecs: z,
                                kind: P,
                                encrypted: u,
                                keyId: w,
                                language: d,
                                label: f,
                                type: c,
                                primary: e,
                                trickModeVideo: null,
                                emsgSchemeIdUris: null,
                                frameRate: void 0,
                                pixelAspectRatio: void 0,
                                width: void 0,
                                height: void 0,
                                bandwidth: void 0,
                                roles: Q,
                                channelsCount: g,
                                audioSamplingRate: null,
                                closedCaptions: h
                            };
                            return n["return"]({
                                stream: T,
                                segmentIndex: M,
                                drmInfos: y,
                                verbatimMediaPlaylistUri: a,
                                absoluteMediaPlaylistUri: p,
                                minTimestamp: K,
                                maxTimestamp: L,
                                duration: N
                            })
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.determinePresentationType_ = function(a) {
            var b = shaka.hls.Utils,
                c = shaka.hls.HlsParser.PresentationType_,
                d = b.getFirstTagWithName(a.tags, "EXT-X-PLAYLIST-TYPE");
            b = b.getFirstTagWithName(a.tags, "EXT-X-ENDLIST");
            b = d && "VOD" == d.value || b;
            d = d && "EVENT" == d.value && !b;
            d = !b && !d;
            b ? this.setPresentationType_(c.VOD) : (d ? this.setPresentationType_(c.LIVE) : this.setPresentationType_(c.EVENT), a = this.getRequiredTag_(a.tags, "EXT-X-TARGETDURATION"), a = Number(a.value), this.maxTargetDuration_ = Math.max(a,
                this.maxTargetDuration_), this.minTargetDuration_ = Math.min(a, this.minTargetDuration_))
        };
        shaka.hls.HlsParser.prototype.createPresentationTimeline_ = function(a) {
            this.isLive_() ? (this.presentationTimeline_ = new shaka.media.PresentationTimeline(0, 3 * this.maxTargetDuration_), this.presentationTimeline_.setStatic(!1)) : (this.presentationTimeline_ = new shaka.media.PresentationTimeline(null, 0), this.presentationTimeline_.setStatic(!0));
            this.notifySegments_();
            goog.asserts.assert(!this.presentationTimeline_.usingPresentationStartTime(), "We should not be using the presentation start time in HLS!")
        };
        shaka.hls.HlsParser.prototype.createInitSegmentReference_ = function(a) {
            var b = shaka.hls.Utils,
                c = b.filterTagsByName(a.tags, "EXT-X-MAP");
            if (!c.length) return null;
            if (1 < c.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_MULTIPLE_MEDIA_INIT_SECTIONS_FOUND);
            c = c[0];
            var d = shaka.hls.HlsParser.getRequiredAttributeValue_(c, "URI"),
                e = b.constructAbsoluteUri(a.absoluteUri, d);
            a = 0;
            b = null;
            if (c = c.getAttributeValue("BYTERANGE")) a = c.split("@"),
                c = Number(a[0]), a = Number(a[1]), b = a + c - 1;
            return new shaka.media.InitSegmentReference(function() {
                return [e]
            }, a, b)
        };
        shaka.hls.HlsParser.prototype.createSegmentReference_ = function(a, b, c, d, e) {
            a = shaka.hls.Utils;
            var f = c.tags,
                g = c.absoluteUri;
            c = this.getRequiredTag_(f, "EXTINF").value.split(",");
            c = e + Number(c[0]);
            var h = 0,
                k = null;
            if (a = a.getFirstTagWithName(f, "EXT-X-BYTERANGE")) f = a.value.split("@"), a = Number(f[0]), f[1] ? h = Number(f[1]) : (goog.asserts.assert(b, "Cannot refer back to previous HLS segment!"), h = b.endByte + 1), k = h + a - 1;
            return new shaka.media.SegmentReference(d, e, c, function() {
                return [g]
            }, h, k)
        };
        shaka.hls.HlsParser.prototype.notifySegments_ = function() {
            var a = this;
            this.presentationTimeline_ && (this.segmentsToNotifyByStream_.forEach(function(b) {
                a.presentationTimeline_.notifySegments(b, 0)
            }), this.segmentsToNotifyByStream_ = [])
        };
        shaka.hls.HlsParser.prototype.createSegments_ = function(a, b, c, d, e) {
            var f = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function h() {
                var k, l, m, n, q, p, t, r, v, u, y;
                return $jscomp.generator.createGenerator(h, function(h) {
                    switch (h.nextAddress) {
                        case 1:
                            return k = b.segments, l = [], goog.asserts.assert(k.length, "Playlist should have segments!"), m = k[0].absoluteUri, n = f.createSegmentReference_(b, null, k[0], c, 0), q = f.createInitSegmentReference_(b), h.yield(f.getStartTime_(a, q, n, d, e), 2);
                        case 2:
                            p = h.yieldResult;
                            shaka.log.debug("First segment",
                                m.split("/").pop(), "starts at", p);
                            for (var w = 0; w < k.length; ++w) t = k[w], r = l[l.length - 1], v = 0 == w ? p : r.endTime, u = c + w, y = f.createSegmentReference_(b, r, t, u, v), l.push(y);
                            f.segmentsToNotifyByStream_.push(l);
                            f.notifySegments_();
                            return h["return"](l)
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.fetchPartialSegment_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            e = shaka.net.NetworkingEngine.RequestType.SEGMENT;
                            f = shaka.util.Networking.createSegmentRequest(a.getUris(), a.startByte, a.startByte + shaka.hls.HlsParser.PARTIAL_SEGMENT_SIZE_ - 1, b.config_.retryParameters);
                            g = shaka.util.Networking.createSegmentRequest(a.getUris(), a.startByte,
                                a.endByte, b.config_.retryParameters);
                            if (b.config_.hls.useFullSegmentsForStartTime) return d["return"](b.makeNetworkRequest_(g, e));
                            d.setCatchFinallyBlocks(2);
                            return d.yield(b.makeNetworkRequest_(f, e), 4);
                        case 4:
                            return h = d.yieldResult, d["return"](h);
                        case 2:
                            k = d.enterCatchBlock();
                            if (k.code == shaka.util.Error.Code.OPERATION_ABORTED) throw k;
                            shaka.log.alwaysWarn("Unable to fetch a partial HLS segment! Falling back to a full segment request, which is expensive!  Your server should support Range requests and CORS preflights.",
                                f.uris[0]);
                            return d.yield(b.makeNetworkRequest_(g, e), 5);
                        case 5:
                            return l = d.yieldResult, d["return"](l)
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.getStartTime_ = function(a, b, c, d, e) {
            var f = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function h() {
                var k, l, m, n, q, p, t, r, v;
                return $jscomp.generator.createGenerator(h, function(h) {
                    switch (h.nextAddress) {
                        case 1:
                            if (f.manifest_) {
                                k = f.uriToStreamInfosMap_.get(a);
                                l = k.segmentIndex;
                                if (m = l.get(c.position)) return shaka.log.v1("Found segment start time in previous manifest"), h["return"](m.startTime);
                                shaka.log.debug("Unable to find segment start time in previous manifest!")
                            }
                            shaka.log.v1("Fetching segment to find start time");
                            d = d.toLowerCase();
                            if (shaka.hls.HlsParser.RAW_FORMATS_.includes(d)) throw shaka.log.alwaysWarn("Raw formats are not yet supported.  Skipping " + d), new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_INTERNAL_SKIP_STREAM);
                            if ("video/webm" == d) throw shaka.log.alwaysWarn("WebM in HLS is not yet supported.  Skipping."), new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_INTERNAL_SKIP_STREAM);
                            if ("video/mp4" != d && "audio/mp4" != d) {
                                h.jumpTo(2);
                                break
                            }
                            n = [f.fetchPartialSegment_(c)];
                            b && n.push(f.fetchPartialSegment_(b));
                            return h.yield(Promise.all(n), 3);
                        case 3:
                            return q = h.yieldResult, p = q[0], t = q[1] || q[0], h["return"](f.getStartTimeFromMp4Segment_(a, p.uri, p.data, t.data));
                        case 2:
                            if ("video/mp2t" != d) {
                                h.jumpTo(4);
                                break
                            }
                            return h.yield(f.fetchPartialSegment_(c), 5);
                        case 5:
                            return r = h.yieldResult, goog.asserts.assert(r.data, "Should have a response body!"), h["return"](f.getStartTimeFromTsSegment_(a, r.uri, r.data));
                        case 4:
                            if ("application/mp4" != d && !d.startsWith("text/")) {
                                h.jumpTo(6);
                                break
                            }
                            return h.yield(f.fetchPartialSegment_(c), 7);
                        case 7:
                            return v = h.yieldResult, goog.asserts.assert(v.data, "Should have a response body!"), h["return"](f.getStartTimeFromTextSegment_(d, e, v.data));
                        case 6:
                            throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_COULD_NOT_PARSE_SEGMENT_START_TIME, a);
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.getStartTimeFromMp4Segment_ = function(a, b, c, d) {
            var e = shaka.util.Mp4Parser,
                f = 0;
            (new e).box("moov", e.children).box("trak", e.children).box("mdia", e.children).fullBox("mdhd", function(a) {
                goog.asserts.assert(0 == a.version || 1 == a.version, "MDHD version can only be 0 or 1");
                a.reader.skip(0 == a.version ? 8 : 16);
                f = a.reader.readUint32();
                a.parser.stop()
            }).parse(d, !0);
            if (!f) throw shaka.log.error("Unable to find timescale in init segment!"), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_COULD_NOT_PARSE_SEGMENT_START_TIME, a, b);
            var g = 0,
                h = !1;
            (new e).box("moof", e.children).box("traf", e.children).fullBox("tfdt", function(a) {
                goog.asserts.assert(0 == a.version || 1 == a.version, "TFDT version can only be 0 or 1");
                g = (0 == a.version ? a.reader.readUint32() : a.reader.readUint64()) / f;
                h = !0;
                a.parser.stop()
            }).parse(c, !0);
            if (!h) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_COULD_NOT_PARSE_SEGMENT_START_TIME,
                a, b);
            return g
        };
        shaka.hls.HlsParser.prototype.getStartTimeFromTsSegment_ = function(a, b, c) {
            var d = new shaka.util.DataViewReader(new DataView(c), shaka.util.DataViewReader.Endianness.BIG_ENDIAN),
                e = function() {
                    throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_COULD_NOT_PARSE_SEGMENT_START_TIME, a, b);
                },
                f = 0,
                g = 0;
            for (c = function() {
                    d.seek(f + 188);
                    g = d.readUint8();
                    71 != g && (d.seek(f + 192), g = d.readUint8());
                    71 != g && (d.seek(f + 204), g = d.readUint8());
                    71 != g && e();
                    d.rewind(1)
                };;) {
                f =
                    d.getPosition();
                g = d.readUint8();
                71 != g && e();
                var h = d.readUint16();
                if (8191 == (h & 8191)) c();
                else if (h & 16384)
                    if (h = (d.readUint8() & 48) >> 4, 0 != h && 2 != h || e(), 3 == h && (h = d.readUint8(), d.skip(h)), 1 != d.readUint32() >> 8) c();
                    else {
                        d.skip(3);
                        c = d.readUint8() >> 6;
                        0 != c && 1 != c || e();
                        h = d.readUint8();
                        0 == h && e();
                        2 == c ? goog.asserts.assert(5 == h, "Bad PES header?") : 3 == c && goog.asserts.assert(10 == h, "Bad PES header?");
                        c = d.readUint8();
                        h = d.readUint16();
                        var k = d.readUint16();
                        return (1073741824 * ((c & 14) >> 1) + ((h & 65534) << 14 | (k & 65534) >> 1)) / shaka.hls.HlsParser.TS_TIMESCALE_
                    }
                else c()
            }
        };
        shaka.hls.HlsParser.prototype.getStartTimeFromTextSegment_ = function(a, b, c) {
            a = shaka.util.MimeUtils.getFullType(a, b);
            if (!shaka.text.TextEngine.isTypeSupported(a)) return 0;
            b = new shaka.text.TextEngine(null);
            b.initParser(a);
            return b.getStartTime(c)
        };
        shaka.hls.HlsParser.filterDuplicateCodecs_ = function(a) {
            var b = new Set,
                c = [];
            a = $jscomp.makeIterator(a);
            for (var d = a.next(); !d.done; d = a.next()) {
                d = d.value;
                var e = shaka.util.MimeUtils.getCodecBase(d);
                b.has(e) ? shaka.log.debug("Ignoring duplicate codec") : (c.push(d), b.add(e))
            }
            return c
        };
        shaka.hls.HlsParser.prototype.guessCodecsSafe_ = function(a, b) {
            for (var c = shaka.util.ManifestParserUtils.ContentType, d = shaka.hls.HlsParser.CODEC_REGEXPS_BY_CONTENT_TYPE_[a], e = 0; e < d.length; e++)
                for (var f = 0; f < b.length; f++)
                    if (d[e].test(b[f].trim())) return b[f].trim();
            return a == c.TEXT ? "" : null
        };
        shaka.hls.HlsParser.prototype.guessCodecs_ = function(a, b) {
            if (1 == b.length) return b[0];
            var c = this.guessCodecsSafe_(a, b);
            if (null != c) return c;
            throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_COULD_NOT_GUESS_CODECS, b);
        };
        shaka.hls.HlsParser.prototype.guessMimeType_ = function(a, b, c) {
            var d = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                var g, h, k, l, m, n, q, p, t, r, v;
                return $jscomp.generator.createGenerator(f, function(f) {
                    switch (f.nextAddress) {
                        case 1:
                            g = shaka.util.ManifestParserUtils.ContentType;
                            h = shaka.hls.HlsParser;
                            k = shaka.net.NetworkingEngine.RequestType.SEGMENT;
                            goog.asserts.assert(c.segments.length, "Playlist should have segments!");
                            l = c.segments[0].absoluteUri;
                            m = new goog.Uri(l);
                            n = m.getPath().split(".").pop();
                            q = h.EXTENSION_MAP_BY_CONTENT_TYPE_[a];
                            if (p = q[n]) return f["return"](p);
                            if (a == g.TEXT) return b && "vtt" != b && "wvtt" != b ? f["return"]("application/mp4") : f["return"]("text/vtt");
                            t = shaka.net.NetworkingEngine.makeRequest([l], d.config_.retryParameters);
                            t.method = "HEAD";
                            return f.yield(d.makeNetworkRequest_(t, k), 2);
                        case 2:
                            r = f.yieldResult;
                            v = r.headers["content-type"];
                            if (!v) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_COULD_NOT_GUESS_MIME_TYPE,
                                n);
                            return f["return"](v.split(";")[0])
                    }
                })
            })
        };
        shaka.hls.HlsParser.getRequiredAttributeValue_ = function(a, b) {
            var c = a.getAttribute(b);
            if (!c) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_REQUIRED_ATTRIBUTE_MISSING, b);
            return c.value
        };
        shaka.hls.HlsParser.prototype.getRequiredTag_ = function(a, b) {
            var c = shaka.hls.Utils.getFirstTagWithName(a, b);
            if (!c) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.HLS_REQUIRED_TAG_MISSING, b);
            return c
        };
        shaka.hls.HlsParser.prototype.addVideoAttributes_ = function(a, b, c, d) {
            a && (a.width = Number(b) || void 0, a.height = Number(c) || void 0, a.frameRate = Number(d) || void 0)
        };
        shaka.hls.HlsParser.prototype.requestManifest_ = function(a) {
            var b = shaka.net.NetworkingEngine.RequestType.MANIFEST;
            a = shaka.net.NetworkingEngine.makeRequest([a], this.config_.retryParameters);
            return this.makeNetworkRequest_(a, b)
        };
        shaka.hls.HlsParser.VIDEO_CODEC_REGEXPS_ = [/^avc/, /^hev/, /^hvc/, /^vp0?[89]/, /^av1$/];
        shaka.hls.HlsParser.AUDIO_CODEC_REGEXPS_ = [/^vorbis$/, /^opus$/, /^flac$/, /^mp4a/, /^[ae]c-3$/];
        shaka.hls.HlsParser.TEXT_CODEC_REGEXPS_ = [/^vtt$/, /^wvtt/, /^stpp/];
        shaka.hls.HlsParser.CODEC_REGEXPS_BY_CONTENT_TYPE_ = {
            audio: shaka.hls.HlsParser.AUDIO_CODEC_REGEXPS_,
            video: shaka.hls.HlsParser.VIDEO_CODEC_REGEXPS_,
            text: shaka.hls.HlsParser.TEXT_CODEC_REGEXPS_
        };
        shaka.hls.HlsParser.AUDIO_EXTENSIONS_TO_MIME_TYPES_ = {
            mp4: "audio/mp4",
            mp4a: "audio/mp4",
            m4s: "audio/mp4",
            m4i: "audio/mp4",
            m4a: "audio/mp4",
            cmfa: "audio/mp4",
            ts: "video/mp2t",
            aac: "audio/aac",
            ac3: "audio/ac3",
            ec3: "audio/ec3",
            mp3: "audio/mpeg"
        };
        shaka.hls.HlsParser.RAW_FORMATS_ = ["audio/aac", "audio/ac3", "audio/ec3", "audio/mpeg"];
        shaka.hls.HlsParser.VIDEO_EXTENSIONS_TO_MIME_TYPES_ = {
            mp4: "video/mp4",
            mp4v: "video/mp4",
            m4s: "video/mp4",
            m4i: "video/mp4",
            m4v: "video/mp4",
            cmfv: "video/mp4",
            ts: "video/mp2t"
        };
        shaka.hls.HlsParser.TEXT_EXTENSIONS_TO_MIME_TYPES_ = {
            mp4: "application/mp4",
            m4s: "application/mp4",
            m4i: "application/mp4",
            cmft: "application/mp4",
            vtt: "text/vtt",
            ttml: "application/ttml+xml"
        };
        shaka.hls.HlsParser.EXTENSION_MAP_BY_CONTENT_TYPE_ = {
            audio: shaka.hls.HlsParser.AUDIO_EXTENSIONS_TO_MIME_TYPES_,
            video: shaka.hls.HlsParser.VIDEO_EXTENSIONS_TO_MIME_TYPES_,
            text: shaka.hls.HlsParser.TEXT_EXTENSIONS_TO_MIME_TYPES_
        };
        shaka.hls.HlsParser.widevineDrmParser_ = function(a) {
            var b = shaka.hls.HlsParser,
                c = b.getRequiredAttributeValue_(a, "METHOD");
            shaka.Deprecate.deprecateFeature(2, 6, "HLS SAMPLE-AES-CENC", "SAMPLE-AES-CENC will no longer be supported, see Issue #1227");
            var d = ["SAMPLE-AES", "SAMPLE-AES-CTR", "SAMPLE-AES-CENC"];
            if (!d.includes(c)) return shaka.log.error("Widevine in HLS is only supported with [", d.join(", "), "], not", c), null;
            b = b.getRequiredAttributeValue_(a, "URI");
            b = shaka.net.DataUriPlugin.parse(b);
            b = new Uint8Array(b.data);
            b = shaka.util.ManifestParserUtils.createDrmInfo("com.widevine.alpha", [{
                initDataType: "cenc",
                initData: b
            }]);
            if (a = a.getAttributeValue("KEYID")) a = a.toLowerCase(), goog.asserts.assert(a.startsWith("0x"), "Incorrect KEYID format!"), b.keyIds = [a.substr(2)];
            return b
        };
        shaka.hls.HlsParser.prototype.onUpdate_ = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            shaka.log.info("Updating manifest...");
                            goog.asserts.assert(0 < a.updatePlaylistDelay_, "We should only call |onUpdate_| when we are suppose to be updating.");
                            if (!a.playerInterface_) return c["return"]();
                            c.setCatchFinallyBlocks(2);
                            return c.yield(a.update(), 4);
                        case 4:
                            d = a.updatePlaylistDelay_;
                            a.updatePlaylistTimer_.tickAfter(d);
                            c.leaveTryBlock(0);
                            break;
                        case 2:
                            e = c.enterCatchBlock();
                            if (!a.playerInterface_) return c["return"]();
                            goog.asserts.assert(e instanceof shaka.util.Error, "Should only receive a Shaka error");
                            e.severity = shaka.util.Error.Severity.RECOVERABLE;
                            a.playerInterface_.onError(e);
                            a.updatePlaylistTimer_.tickAfter(.1);
                            c.jumpToEnd()
                    }
                })
            })
        };
        shaka.hls.HlsParser.prototype.isLive_ = function() {
            return this.presentationType_ != shaka.hls.HlsParser.PresentationType_.VOD
        };
        shaka.hls.HlsParser.prototype.setPresentationType_ = function(a) {
            this.presentationType_ = a;
            this.presentationTimeline_ && this.presentationTimeline_.setStatic(!this.isLive_());
            this.isLive_() || this.updatePlaylistTimer_.stop()
        };
        shaka.hls.HlsParser.prototype.makeNetworkRequest_ = function(a, b) {
            if (!this.operationManager_) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.OPERATION_ABORTED);
            var c = this.playerInterface_.networkingEngine.request(b, a);
            this.operationManager_.manage(c);
            return c.promise
        };
        shaka.hls.HlsParser.KEYFORMATS_TO_DRM_PARSERS_ = {
            "urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed": shaka.hls.HlsParser.widevineDrmParser_
        };
        shaka.hls.HlsParser.PresentationType_ = {
            VOD: "VOD",
            EVENT: "EVENT",
            LIVE: "LIVE"
        };
        shaka.hls.HlsParser.TS_TIMESCALE_ = 9E4;
        shaka.hls.HlsParser.TS_ROLLOVER_ = 8589934592;
        shaka.hls.HlsParser.PARTIAL_SEGMENT_SIZE_ = 2048;
        shaka.media.ManifestParser.registerParserByExtension("m3u8", shaka.hls.HlsParser);
        shaka.media.ManifestParser.registerParserByMime("application/x-mpegurl", shaka.hls.HlsParser);
        shaka.media.ManifestParser.registerParserByMime("application/vnd.apple.mpegurl", shaka.hls.HlsParser);
        shaka.media.ActiveStreamMap = function() {
            this.history_ = new Map
        };
        shaka.media.ActiveStreamMap.prototype.clear = function() {
            this.history_.clear()
        };
        shaka.media.ActiveStreamMap.prototype.useVariant = function(a, b) {
            this.getFrameFor_(a).variant = b
        };
        shaka.media.ActiveStreamMap.prototype.useText = function(a, b) {
            this.getFrameFor_(a).text = b
        };
        shaka.media.ActiveStreamMap.prototype.getVariant = function(a) {
            return this.getFrameFor_(a).variant
        };
        shaka.media.ActiveStreamMap.prototype.getText = function(a) {
            return this.getFrameFor_(a).text
        };
        shaka.media.ActiveStreamMap.prototype.getFrameFor_ = function(a) {
            if (!this.history_.has(a)) {
                var b = new shaka.media.ActiveStreamMap.Frame;
                this.history_.set(a, b)
            }
            return this.history_.get(a)
        };
        shaka.media.ActiveStreamMap.Frame = function() {
            this.text = this.variant = null
        };
        shaka.media.AdaptationSet = function(a, b) {
            this.root_ = a;
            this.variants_ = new Set([a]);
            b = b || [];
            for (var c = $jscomp.makeIterator(b), d = c.next(); !d.done; d = c.next()) this.add(d.value)
        };
        shaka.media.AdaptationSet.prototype.add = function(a) {
            if (this.canInclude(a)) return this.variants_.add(a), !0;
            shaka.log.warning("Rejecting variant - not compatible with root.");
            return !1
        };
        shaka.media.AdaptationSet.prototype.canInclude = function(a) {
            return shaka.media.AdaptationSet.areAdaptable(this.root_, a)
        };
        shaka.media.AdaptationSet.areAdaptable = function(a, b) {
            var c = shaka.media.AdaptationSet;
            if (!!a.audio != !!b.audio || !!a.video != !!b.video || a.language != b.language) return !1;
            goog.asserts.assert(!!a.audio == !!b.audio, "Both should either have audio or not have audio.");
            if (a.audio && b.audio && !c.areAudiosCompatible_(a.audio, b.audio)) return !1;
            goog.asserts.assert(!!a.video == !!b.video, "Both should either have video or not have video.");
            return a.video && b.video && !c.areVideosCompatible_(a.video, b.video) ? !1 : !0
        };
        shaka.media.AdaptationSet.prototype.values = function() {
            return this.variants_.values()
        };
        shaka.media.AdaptationSet.areAudiosCompatible_ = function(a, b) {
            var c = shaka.media.AdaptationSet;
            return a.channelsCount == b.channelsCount && c.canTransitionBetween_(a, b) && c.areRolesEqual_(a.roles, b.roles) ? !0 : !1
        };
        shaka.media.AdaptationSet.areVideosCompatible_ = function(a, b) {
            var c = shaka.media.AdaptationSet;
            return c.canTransitionBetween_(a, b) && c.areRolesEqual_(a.roles, b.roles) ? !0 : !1
        };
        shaka.media.AdaptationSet.canTransitionBetween_ = function(a, b) {
            if (a.mimeType != b.mimeType) return !1;
            var c = shaka.util.MimeUtils.splitCodecs(a.codecs).map(function(a) {
                    return shaka.util.MimeUtils.getCodecBase(a)
                }),
                d = shaka.util.MimeUtils.splitCodecs(b.codecs).map(function(a) {
                    return shaka.util.MimeUtils.getCodecBase(a)
                });
            if (c.length != d.length) return !1;
            c.sort();
            d.sort();
            for (var e = 0; e < c.length; e++)
                if (c[e] != d[e]) return !1;
            return !0
        };
        shaka.media.AdaptationSet.areRolesEqual_ = function(a, b) {
            var c = new Set(a),
                d = new Set(b);
            c["delete"]("main");
            d["delete"]("main");
            if (c.size != d.size) return !1;
            c = $jscomp.makeIterator(c);
            for (var e = c.next(); !e.done; e = c.next())
                if (!d.has(e.value)) return !1;
            return !0
        };
        shaka.media.AdaptationSetCriteria = function() {};
        shaka.media.AdaptationSetCriteria.prototype.create = function(a) {};
        shaka.media.ExampleBasedCriteria = function(a) {
            this.example_ = a;
            this.fallback_ = new shaka.media.PreferenceBasedCriteria(a.language, "", a.audio && a.audio.channelsCount ? a.audio.channelsCount : 0, "")
        };
        shaka.media.ExampleBasedCriteria.prototype.create = function(a) {
            var b = this,
                c = a.filter(function(a) {
                    return shaka.media.AdaptationSet.areAdaptable(b.example_, a)
                });
            return c.length ? new shaka.media.AdaptationSet(c[0], c) : this.fallback_.create(a)
        };
        shaka.media.PreferenceBasedCriteria = function(a, b, c, d) {
            this.language_ = a;
            this.role_ = b;
            this.channelCount_ = c;
            this.label_ = void 0 === d ? "" : d
        };
        shaka.media.PreferenceBasedCriteria.prototype.create = function(a) {
            var b = shaka.media.PreferenceBasedCriteria,
                c = shaka.util.StreamUtils,
                d = [];
            d = b.filterByLanguage_(a, this.language_);
            var e = a.filter(function(a) {
                return a.primary
            });
            d = d.length ? d : e.length ? e : a;
            a = b.filterVariantsByRole_(d, this.role_);
            a.length ? d = a : shaka.log.warning("No exact match for variant role could be found.");
            this.channelCount_ && (c = c.filterVariantsByAudioChannelCount(d, this.channelCount_), c.length ? d = c : shaka.log.warning("No exact match for the channel count could be found."));
            this.label_ && (b = b.filterVariantsByLabel_(d, this.label_), b.length ? d = b : shaka.log.warning("No exact match for variant label could be found."));
            b = new shaka.media.AdaptationSet(d[0]);
            d = $jscomp.makeIterator(d);
            for (c = d.next(); !c.done; c = d.next()) c = c.value, b.canInclude(c) && b.add(c);
            return b
        };
        shaka.media.PreferenceBasedCriteria.filterByLanguage_ = function(a, b) {
            var c = shaka.util.LanguageUtils,
                d = c.normalize(b),
                e = c.findClosestLocale(d, a.map(function(a) {
                    return c.getLocaleForVariant(a)
                }));
            return e ? a.filter(function(a) {
                return e == c.getLocaleForVariant(a)
            }) : []
        };
        shaka.media.PreferenceBasedCriteria.filterVariantsByRole_ = function(a, b) {
            return a.filter(function(a) {
                return a.audio ? b ? a.audio.roles.includes(b) : 0 == a.audio.roles.length : !1
            })
        };
        shaka.media.PreferenceBasedCriteria.filterVariantsByLabel_ = function(a, b) {
            return a.filter(function(a) {
                if (!a.audio) return !1;
                a = a.audio.label.toLowerCase();
                var c = b.toLowerCase();
                return a == c
            })
        };
        shaka.media.BufferingObserver = function(a, b) {
            var c = shaka.media.BufferingObserver.State;
            this.previousState_ = c.SATISFIED;
            this.thresholds_ = (new Map).set(c.SATISFIED, b).set(c.STARVING, a)
        };
        shaka.media.BufferingObserver.prototype.setThresholds = function(a, b) {
            var c = shaka.media.BufferingObserver.State;
            this.thresholds_.set(c.SATISFIED, b).set(c.STARVING, a)
        };
        shaka.media.BufferingObserver.prototype.update = function(a, b) {
            var c = shaka.media.BufferingObserver.State,
                d = this.thresholds_.get(this.previousState_),
                e = this.previousState_;
            this.previousState_ = c = b || a >= d ? c.SATISFIED : c.STARVING;
            return e != c
        };
        shaka.media.BufferingObserver.prototype.setState = function(a) {
            this.previousState_ = a
        };
        shaka.media.BufferingObserver.prototype.getState = function() {
            return this.previousState_
        };
        shaka.media.BufferingObserver.State = {
            STARVING: 0,
            SATISFIED: 1
        };
        shaka.media.StallDetector = function(a, b) {
            this.implementation_ = a;
            this.wasMakingProgress_ = a.shouldBeMakingProgress();
            this.value_ = a.getPresentationSeconds();
            this.lastUpdateSeconds_ = a.getWallSeconds();
            this.didJump_ = !1;
            this.stallThresholdSeconds_ = b;
            this.onStall_ = function() {}
        };
        shaka.media.StallDetector.prototype.release = function() {
            this.implementation_ = null;
            this.onStall_ = function() {}
        };
        shaka.media.StallDetector.prototype.onStall = function(a) {
            this.onStall_ = a
        };
        shaka.media.StallDetector.prototype.poll = function() {
            var a = this.implementation_,
                b = a.shouldBeMakingProgress(),
                c = a.getPresentationSeconds(),
                d = a.getWallSeconds();
            if (this.value_ != c || this.wasMakingProgress_ != b) this.lastUpdateSeconds_ = d, this.value_ = c, this.wasMakingProgress_ = b, this.didJump_ = !1;
            c = d - this.lastUpdateSeconds_;
            if (b = c >= this.stallThresholdSeconds_ && b && !this.didJump_) this.onStall_(this.value_, c), this.didJump_ = !0, this.value_ = a.getPresentationSeconds();
            return b
        };
        shaka.media.StallDetector.Implementation = function() {};
        shaka.media.StallDetector.Implementation.prototype.shouldBeMakingProgress = function() {};
        shaka.media.StallDetector.Implementation.prototype.getPresentationSeconds = function() {};
        shaka.media.StallDetector.Implementation.prototype.getWallSeconds = function() {};
        shaka.media.StallDetector.MediaElementImplementation = function(a) {
            this.mediaElement_ = a
        };
        shaka.media.StallDetector.MediaElementImplementation.prototype.shouldBeMakingProgress = function() {
            return this.mediaElement_.paused || 0 == this.mediaElement_.playbackRate || 0 == this.mediaElement_.buffered.length ? !1 : shaka.media.StallDetector.MediaElementImplementation.hasContentFor_(this.mediaElement_.buffered, this.mediaElement_.currentTime)
        };
        shaka.media.StallDetector.MediaElementImplementation.prototype.getPresentationSeconds = function() {
            return this.mediaElement_.currentTime
        };
        shaka.media.StallDetector.MediaElementImplementation.prototype.getWallSeconds = function() {
            return Date.now() / 1E3
        };
        shaka.media.StallDetector.MediaElementImplementation.hasContentFor_ = function(a, b) {
            for (var c = 0; c < a.length; c++) {
                var d = a.start(c),
                    e = a.end(c);
                if (!(b < d - .1 || b > e - .5)) return !0
            }
            return !1
        };
        shaka.media.GapJumpingController = function(a, b, c, d, e) {
            var f = this;
            this.video_ = a;
            this.timeline_ = b;
            this.config_ = c;
            this.onEvent_ = e;
            this.eventManager_ = new shaka.util.EventManager;
            this.seekingEventReceived_ = !1;
            this.prevReadyState_ = a.readyState;
            this.didFireLargeGap_ = !1;
            this.stallDetector_ = d;
            this.hadSegmentAppended_ = !1;
            this.eventManager_.listen(a, "waiting", function() {
                return f.onPollGapJump_()
            });
            this.gapJumpTimer_ = (new shaka.util.Timer(function() {
                f.onPollGapJump_()
            })).tickEvery(.25)
        };
        shaka.media.GapJumpingController.BROWSER_GAP_TOLERANCE = .001;
        shaka.media.GapJumpingController.prototype.release = function() {
            this.eventManager_ && (this.eventManager_.release(), this.eventManager_ = null);
            null != this.gapJumpTimer_ && (this.gapJumpTimer_.stop(), this.gapJumpTimer_ = null);
            this.stallDetector_ && (this.stallDetector_.release(), this.stallDetector_ = null);
            this.video_ = this.timeline_ = this.onEvent_ = null
        };
        shaka.media.GapJumpingController.prototype.onSegmentAppended = function() {
            this.hadSegmentAppended_ = !0;
            this.onPollGapJump_()
        };
        shaka.media.GapJumpingController.prototype.onSeeking = function() {
            this.seekingEventReceived_ = !0;
            this.didFireLargeGap_ = this.hadSegmentAppended_ = !1
        };
        shaka.media.GapJumpingController.prototype.onPollGapJump_ = function() {
            if (0 != this.video_.readyState) {
                if (this.video_.seeking) {
                    if (!this.seekingEventReceived_) return
                } else this.seekingEventReceived_ = !1;
                if (!this.video_.paused && (this.video_.readyState != this.prevReadyState_ && (this.didFireLargeGap_ = !1, this.prevReadyState_ = this.video_.readyState), !this.stallDetector_ || !this.stallDetector_.poll())) {
                    var a = this.config_.smallGapLimit,
                        b = this.video_.currentTime,
                        c = this.video_.buffered,
                        d = shaka.media.TimeRangesUtils.getGapIndex(c,
                            b);
                    if (null != d && (0 != d || this.hadSegmentAppended_)) {
                        var e = c.start(d),
                            f = this.timeline_.getSeekRangeEnd();
                        if (!(e >= f)) {
                            f = e - b;
                            a = f <= a;
                            var g = !1;
                            if (!(f < shaka.media.GapJumpingController.BROWSER_GAP_TOLERANCE)) {
                                if (!a && !this.didFireLargeGap_) {
                                    this.didFireLargeGap_ = !0;
                                    var h = new shaka.util.FakeEvent("largegap", {
                                        currentTime: b,
                                        gapSize: f
                                    });
                                    h.cancelable = !0;
                                    this.onEvent_(h);
                                    this.config_.jumpLargeGaps && !h.defaultPrevented ? g = !0 : shaka.log.info("Ignoring large gap at", b, "size", f)
                                }
                                if (a || g) 0 == d ? shaka.log.info("Jumping forward",
                                    f, "seconds because of gap before start time of", e) : shaka.log.info("Jumping forward", f, "seconds because of gap starting at", c.end(d - 1), "and ending at", e), this.video_.currentTime = e
                            }
                        }
                    }
                }
            }
        };
        shaka.media.IPlayheadObserver = function() {};
        shaka.media.IPlayheadObserver.prototype.poll = function(a, b) {};
        shaka.media.PlayheadObserverManager = function(a) {
            var b = this;
            this.mediaElement_ = a;
            this.observers_ = new Set;
            this.pollingLoop_ = (new shaka.util.Timer(function() {
                b.pollAllObservers_(!1)
            })).tickEvery(.25)
        };
        shaka.media.PlayheadObserverManager.prototype.release = function() {
            this.pollingLoop_.stop();
            for (var a = $jscomp.makeIterator(this.observers_), b = a.next(); !b.done; b = a.next()) b.value.release();
            this.observers_.clear()
        };
        shaka.media.PlayheadObserverManager.prototype.manage = function(a) {
            this.observers_.add(a)
        };
        shaka.media.PlayheadObserverManager.prototype.notifyOfSeek = function() {
            this.pollAllObservers_(!0)
        };
        shaka.media.PlayheadObserverManager.prototype.pollAllObservers_ = function(a) {
            for (var b = $jscomp.makeIterator(this.observers_), c = b.next(); !c.done; c = b.next()) c.value.poll(this.mediaElement_.currentTime, a)
        };
        shaka.util.Periods = function() {};
        shaka.util.Periods.getAllVariantsFrom = function(a) {
            var b = [];
            a = $jscomp.makeIterator(a);
            for (var c = a.next(); !c.done; c = a.next()) {
                c = $jscomp.makeIterator(c.value.variants);
                for (var d = c.next(); !d.done; d = c.next()) b.push(d.value)
            }
            return b
        };
        shaka.util.Periods.findPeriodForTime = function(a, b) {
            for (var c = null, d = $jscomp.makeIterator(a), e = d.next(); !e.done; e = d.next()) e = e.value, b >= e.startTime && (c = e);
            return c
        };
        shaka.media.PeriodObserver = function(a) {
            this.manifest_ = a;
            this.currentPeriod_ = null;
            this.onChangedPeriods_ = function(a) {}
        };
        shaka.media.PeriodObserver.prototype.release = function() {
            this.currentPeriod_ = this.manifest_ = null;
            this.onChangedPeriods_ = function(a) {}
        };
        shaka.media.PeriodObserver.prototype.poll = function(a, b) {
            var c = this.currentPeriod_,
                d = this.findCurrentPeriod_(a);
            if (c != d) this.onChangedPeriods_(d);
            this.currentPeriod_ = d
        };
        shaka.media.PeriodObserver.prototype.setListeners = function(a) {
            this.onChangedPeriods_ = a
        };
        shaka.media.PeriodObserver.prototype.findCurrentPeriod_ = function(a) {
            var b = this.manifest_.periods;
            return shaka.util.Periods.findPeriodForTime(b, a) || b[0]
        };
        shaka.media.PlayRateController = function(a) {
            var b = this;
            this.harness_ = a;
            this.isBuffering_ = !1;
            this.rate_ = this.harness_.getRate();
            this.pollRate_ = .25;
            this.timer_ = new shaka.util.Timer(function() {
                b.harness_.movePlayhead(b.rate_ * b.pollRate_)
            })
        };
        shaka.media.PlayRateController.prototype.release = function() {
            this.timer_ && (this.timer_.stop(), this.timer_ = null);
            this.harness_ = null
        };
        shaka.media.PlayRateController.prototype.setBuffering = function(a) {
            this.isBuffering_ = a;
            this.apply_()
        };
        shaka.media.PlayRateController.prototype.set = function(a) {
            goog.asserts.assert(0 != a, "Should never set rate of 0 explicitly!");
            this.rate_ = a;
            this.apply_()
        };
        shaka.media.PlayRateController.prototype.getActiveRate = function() {
            return this.calculateCurrentRate_()
        };
        shaka.media.PlayRateController.prototype.apply_ = function() {
            this.timer_.stop();
            var a = this.calculateCurrentRate_();
            if (0 <= a) try {
                this.applyRate_(a);
                return
            } catch (b) {}
            this.timer_.tickEvery(this.pollRate_);
            this.applyRate_(0)
        };
        shaka.media.PlayRateController.prototype.calculateCurrentRate_ = function() {
            return this.isBuffering_ ? 0 : this.rate_
        };
        shaka.media.PlayRateController.prototype.applyRate_ = function(a) {
            var b = this.harness_.getRate();
            b != a && this.harness_.setRate(a);
            return b != a
        };
        /*

         Copyright 2016 Google LLC
         SPDX-License-Identifier: Apache-2.0
        */
        shaka.util.MediaReadyState = function() {};
        shaka.util.MediaReadyState.waitForReadyState = function(a, b, c, d) {
            b == HTMLMediaElement.HAVE_NOTHING || a.readyState >= b ? d() : (b = shaka.util.MediaReadyState.READY_STATES_TO_EVENT_NAMES_.get(b), c.listenOnce(a, b, d))
        };
        shaka.util.MediaReadyState.READY_STATES_TO_EVENT_NAMES_ = new Map([
            [HTMLMediaElement.HAVE_METADATA, "loadedmetadata"],
            [HTMLMediaElement.HAVE_CURRENT_DATA, "loadeddata"],
            [HTMLMediaElement.HAVE_FUTURE_DATA, "canplay"],
            [HTMLMediaElement.HAVE_ENOUGH_DATA, "canplaythrough"]
        ]);
        shaka.media.VideoWrapper = function(a, b, c) {
            var d = this;
            this.video_ = a;
            this.onSeek_ = b;
            this.startTime_ = c;
            this.started_ = !1;
            this.eventManager_ = new shaka.util.EventManager;
            this.mover_ = new shaka.media.VideoWrapper.PlayheadMover(a, 10);
            shaka.util.MediaReadyState.waitForReadyState(this.video_, HTMLMediaElement.HAVE_METADATA, this.eventManager_, function() {
                d.setStartTime_(d.startTime_)
            })
        };
        shaka.media.VideoWrapper.prototype.release = function() {
            this.eventManager_ && (this.eventManager_.release(), this.eventManager_ = null);
            null != this.mover_ && (this.mover_.release(), this.mover_ = null);
            this.onSeek_ = function() {};
            this.video_ = null
        };
        shaka.media.VideoWrapper.prototype.getTime = function() {
            return this.started_ ? this.video_.currentTime : this.startTime_
        };
        shaka.media.VideoWrapper.prototype.setTime = function(a) {
            var b = this;
            0 < this.video_.readyState ? this.mover_.moveTo(a) : shaka.util.MediaReadyState.waitForReadyState(this.video_, HTMLMediaElement.HAVE_METADATA, this.eventManager_, function() {
                b.setStartTime_(b.startTime_)
            })
        };
        shaka.media.VideoWrapper.prototype.setStartTime_ = function(a) {
            var b = this;
            .001 > Math.abs(this.video_.currentTime - a) ? this.startListeningToSeeks_() : (this.eventManager_.listenOnce(this.video_, "seeking", function() {
                b.startListeningToSeeks_()
            }), this.mover_.moveTo(0 == this.video_.currentTime ? a : this.video_.currentTime))
        };
        shaka.media.VideoWrapper.prototype.startListeningToSeeks_ = function() {
            var a = this;
            goog.asserts.assert(0 < this.video_.readyState, "The media element should be ready before we listen for seeking.");
            this.started_ = !0;
            this.eventManager_.listen(this.video_, "seeking", function() {
                return a.onSeek_()
            })
        };
        shaka.media.VideoWrapper.PlayheadMover = function(a, b) {
            var c = this;
            this.mediaElement_ = a;
            this.maxAttempts_ = b;
            this.targetTime_ = this.originTime_ = this.remainingAttempts_ = 0;
            this.timer_ = new shaka.util.Timer(function() {
                return c.onTick_()
            })
        };
        shaka.media.VideoWrapper.PlayheadMover.prototype.release = function() {
            this.timer_ && (this.timer_.stop(), this.timer_ = null);
            this.mediaElement_ = null
        };
        shaka.media.VideoWrapper.PlayheadMover.prototype.moveTo = function(a) {
            this.originTime_ = this.mediaElement_.currentTime;
            this.targetTime_ = a;
            this.remainingAttempts_ = this.maxAttempts_;
            this.mediaElement_.currentTime = a;
            this.timer_.tickEvery(.1)
        };
        shaka.media.VideoWrapper.PlayheadMover.prototype.onTick_ = function() {
            0 >= this.remainingAttempts_ ? (shaka.log.warning(["Failed to move playhead from", this.originTime_, "to", this.targetTime_].join(" ")), this.timer_.stop()) : this.mediaElement_.currentTime != this.originTime_ ? this.timer_.stop() : (this.mediaElement_.currentTime = this.targetTime_, this.remainingAttempts_--)
        };
        shaka.media.Playhead = function() {};
        shaka.media.Playhead.prototype.setStartTime = function(a) {};
        shaka.media.Playhead.prototype.getTime = function() {};
        shaka.media.Playhead.prototype.notifyOfBufferingChange = function() {};
        shaka.media.SrcEqualsPlayhead = function(a) {
            var b = this;
            this.mediaElement_ = a;
            this.started_ = !1;
            this.startTime_ = null;
            this.eventManager_ = new shaka.util.EventManager;
            var c = function() {
                null == b.startTime_ ? b.started_ = !0 : (b.eventManager_.listenOnce(b.mediaElement_, "seeking", function() {
                    b.started_ = !0
                }), b.mediaElement_.currentTime = Math.max(0, b.mediaElement_.currentTime + b.startTime_))
            };
            shaka.util.MediaReadyState.waitForReadyState(this.mediaElement_, HTMLMediaElement.HAVE_CURRENT_DATA, this.eventManager_, function() {
                c()
            })
        };
        shaka.media.SrcEqualsPlayhead.prototype.release = function() {
            this.eventManager_ && (this.eventManager_.release(), this.eventManager_ = null);
            this.mediaElement_ = null
        };
        shaka.media.SrcEqualsPlayhead.prototype.setStartTime = function(a) {
            this.startTime_ = this.started_ ? this.startTime_ : a
        };
        shaka.media.SrcEqualsPlayhead.prototype.getTime = function() {
            return (this.started_ ? this.mediaElement_.currentTime : this.startTime_) || 0
        };
        shaka.media.SrcEqualsPlayhead.prototype.notifyOfBufferingChange = function() {};
        shaka.media.MediaSourcePlayhead = function(a, b, c, d, e, f) {
            var g = this;
            this.minSeekRange_ = 3;
            this.mediaElement_ = a;
            this.timeline_ = b.presentationTimeline;
            this.minBufferTime_ = b.minBufferTime || 0;
            this.config_ = c;
            this.onSeek_ = e;
            this.lastCorrectiveSeek_ = null;
            this.gapController_ = new shaka.media.GapJumpingController(a, b.presentationTimeline, c, this.createStallDetector_(a, c), f);
            this.videoWrapper_ = new shaka.media.VideoWrapper(a, function() {
                return g.onSeeking_()
            }, this.getStartTime_(d));
            this.checkWindowTimer_ = (new shaka.util.Timer(function() {
                g.onPollWindow_()
            })).tickEvery(.25)
        };
        shaka.media.MediaSourcePlayhead.prototype.release = function() {
            this.videoWrapper_ && (this.videoWrapper_.release(), this.videoWrapper_ = null);
            this.gapController_ && (this.gapController_.release(), this.gapController_ = null);
            this.checkWindowTimer_ && (this.checkWindowTimer_.stop(), this.checkWindowTimer_ = null);
            this.mediaElement_ = this.videoWrapper_ = this.timeline_ = this.config_ = null;
            this.onSeek_ = function() {}
        };
        shaka.media.MediaSourcePlayhead.prototype.setStartTime = function(a) {
            this.videoWrapper_.setTime(a)
        };
        shaka.media.MediaSourcePlayhead.prototype.getTime = function() {
            var a = this.videoWrapper_.getTime();
            return 0 < this.mediaElement_.readyState && !this.mediaElement_.paused ? this.clampTime_(a) : a
        };
        shaka.media.MediaSourcePlayhead.prototype.getStartTime_ = function(a) {
            null == a ? a = Infinity > this.timeline_.getDuration() ? this.timeline_.getSeekRangeStart() : this.timeline_.getSeekRangeEnd() : 0 > a && (a = this.timeline_.getSeekRangeEnd() + a);
            return this.clampSeekToDuration_(this.clampTime_(a))
        };
        shaka.media.MediaSourcePlayhead.prototype.notifyOfBufferingChange = function() {
            this.gapController_.onSegmentAppended()
        };
        shaka.media.MediaSourcePlayhead.prototype.onPollWindow_ = function() {
            if (0 != this.mediaElement_.readyState && !this.mediaElement_.paused) {
                var a = this.videoWrapper_.getTime(),
                    b = this.timeline_.getSeekRangeStart(),
                    c = this.timeline_.getSeekRangeEnd();
                c - b < this.minSeekRange_ && (b = c - this.minSeekRange_);
                a < b && (b = this.reposition_(a), shaka.log.info("Jumping forward " + (b - a) + " seconds to catch up with the seek range."), this.mediaElement_.currentTime = b)
            }
        };
        shaka.media.MediaSourcePlayhead.prototype.onSeeking_ = function() {
            this.gapController_.onSeeking();
            var a = this.videoWrapper_.getTime(),
                b = this.reposition_(a);
            if (Math.abs(b - a) > shaka.media.GapJumpingController.BROWSER_GAP_TOLERANCE) {
                var c = Date.now() / 1E3;
                if (!this.lastCorrectiveSeek_ || this.lastCorrectiveSeek_ < c - 1) {
                    this.lastCorrectiveSeek_ = c;
                    this.videoWrapper_.setTime(b);
                    return
                }
            }
            shaka.log.v1("Seek to " + a);
            this.onSeek_()
        };
        shaka.media.MediaSourcePlayhead.prototype.clampSeekToDuration_ = function(a) {
            var b = this.timeline_.getDuration();
            return a >= b ? (goog.asserts.assert(0 <= this.config_.durationBackoff, "Duration backoff must be non-negative!"), b - this.config_.durationBackoff) : a
        };
        shaka.media.MediaSourcePlayhead.prototype.reposition_ = function(a) {
            goog.asserts.assert(this.config_, "Cannot reposition playhead when it has beeen destroyed");
            var b = shaka.media.TimeRangesUtils.isBuffered.bind(null, this.mediaElement_.buffered),
                c = Math.max(this.minBufferTime_, this.config_.rebufferingGoal),
                d = this.config_.safeSeekOffset,
                e = this.timeline_.getSeekRangeStart(),
                f = this.timeline_.getSeekRangeEnd(),
                g = this.timeline_.getDuration();
            f - e < this.minSeekRange_ && (e = f - this.minSeekRange_);
            var h = this.timeline_.getSafeSeekRangeStart(c),
                k = this.timeline_.getSafeSeekRangeStart(d);
            c = this.timeline_.getSafeSeekRangeStart(c + d);
            if (a >= g) return shaka.log.v1("Playhead past duration."), this.clampSeekToDuration_(a);
            if (a > f) return shaka.log.v1("Playhead past end."), f;
            if (a < e) {
                if (b(k)) return shaka.log.v1("Playhead before start & start is buffered"), k;
                shaka.log.v1("Playhead before start & start is unbuffered");
                return c
            }
            if (a >= h || b(a)) return shaka.log.v1("Playhead in safe region or in buffered region."), a;
            shaka.log.v1("Playhead outside safe region & in unbuffered region.");
            return c
        };
        shaka.media.MediaSourcePlayhead.prototype.clampTime_ = function(a) {
            var b = this.timeline_.getSeekRangeStart();
            if (a < b) return b;
            b = this.timeline_.getSeekRangeEnd();
            return a > b ? b : a
        };
        shaka.media.MediaSourcePlayhead.prototype.createStallDetector_ = function(a, b) {
            if (!b.stallEnabled) return null;
            var c = b.stallThreshold,
                d = b.stallSkip;
            c = new shaka.media.StallDetector(new shaka.media.StallDetector.MediaElementImplementation(a), c);
            c.onStall(function(b, c) {
                shaka.log.debug("Stall detected at " + b + " for " + c + " seconds.");
                d ? (shaka.log.debug("Seeking forward " + d + " seconds to break stall."), a.currentTime += d) : (shaka.log.debug("Pausing and unpausing to break stall."), a.pause(), a.play())
            });
            return c
        };
        shaka.media.RegionTimeline = function(a) {
            var b = this;
            this.onAddRegion_ = function(a) {};
            this.regions_ = new Set;
            this.getSeekRange_ = a;
            this.filterTimer_ = (new shaka.util.Timer(function() {
                b.filterBySeekRange_()
            })).tickEvery(shaka.media.RegionTimeline.REGION_FILTER_INTERVAL)
        };
        shaka.media.RegionTimeline.prototype.release = function() {
            this.onAddRegion_ = function(a) {};
            this.regions_.clear();
            this.filterTimer_.stop()
        };
        shaka.media.RegionTimeline.prototype.setListeners = function(a) {
            this.onAddRegion_ = a
        };
        shaka.media.RegionTimeline.prototype.addRegion = function(a) {
            null == this.findSimilarRegion_(a) && (this.regions_.add(a), this.onAddRegion_(a))
        };
        shaka.media.RegionTimeline.prototype.filterBySeekRange_ = function() {
            for (var a = this.getSeekRange_(), b = $jscomp.makeIterator(this.regions_), c = b.next(); !c.done; c = b.next()) c = c.value, c.endTime < a.start && this.regions_["delete"](c)
        };
        shaka.media.RegionTimeline.prototype.findSimilarRegion_ = function(a) {
            for (var b = $jscomp.makeIterator(this.regions_), c = b.next(); !c.done; c = b.next())
                if (c = c.value, c.schemeIdUri == a.schemeIdUri && c.id == a.id && c.startTime == a.startTime && c.endTime == a.endTime) return c;
            return null
        };
        shaka.media.RegionTimeline.prototype.regions = function() {
            return this.regions_
        };
        shaka.media.RegionTimeline.REGION_FILTER_INTERVAL = 2;
        shaka.media.RegionObserver = function(a) {
            var b = this;
            this.timeline_ = a;
            this.oldPosition_ = new Map;
            this.onEnter_ = function(a, b) {};
            this.onExit_ = function(a, b) {};
            this.onSkip_ = function(a, b) {};
            var c = shaka.media.RegionObserver.RelativePosition_;
            a = c.BEFORE_THE_REGION;
            var d = c.IN_THE_REGION;
            c = c.AFTER_THE_REGION;
            this.rules_ = [{
                    weWere: null,
                    weAre: d,
                    invoke: function(a, c) {
                        return b.onEnter_(a, c)
                    }
                }, {
                    weWere: a,
                    weAre: d,
                    invoke: function(a, c) {
                        return b.onEnter_(a, c)
                    }
                }, {
                    weWere: c,
                    weAre: d,
                    invoke: function(a, c) {
                        return b.onEnter_(a, c)
                    }
                },
                {
                    weWere: d,
                    weAre: a,
                    invoke: function(a, c) {
                        return b.onExit_(a, c)
                    }
                }, {
                    weWere: d,
                    weAre: c,
                    invoke: function(a, c) {
                        return b.onExit_(a, c)
                    }
                }, {
                    weWere: a,
                    weAre: c,
                    invoke: function(a, c) {
                        return b.onSkip_(a, c)
                    }
                }, {
                    weWere: c,
                    weAre: a,
                    invoke: function(a, c) {
                        return b.onSkip_(a, c)
                    }
                }
            ]
        };
        shaka.media.RegionObserver.prototype.release = function() {
            this.timeline_ = null;
            this.oldPosition_.clear();
            this.onEnter_ = function(a, b) {};
            this.onExit_ = function(a, b) {};
            this.onSkip_ = function(a, b) {}
        };
        shaka.media.RegionObserver.prototype.poll = function(a, b) {
            for (var c = shaka.media.RegionObserver, d = $jscomp.makeIterator(this.timeline_.regions()), e = d.next(); !e.done; e = d.next()) {
                e = e.value;
                var f = this.oldPosition_.get(e),
                    g = c.determinePositionRelativeTo_(e, a);
                this.oldPosition_.set(e, g);
                for (var h = $jscomp.makeIterator(this.rules_), k = h.next(); !k.done; k = h.next()) k = k.value, k.weWere == f && k.weAre == g && k.invoke(e, b)
            }
        };
        shaka.media.RegionObserver.prototype.setListeners = function(a, b, c) {
            this.onEnter_ = a;
            this.onExit_ = b;
            this.onSkip_ = c
        };
        shaka.media.RegionObserver.determinePositionRelativeTo_ = function(a, b) {
            var c = shaka.media.RegionObserver.RelativePosition_;
            return b < a.startTime ? c.BEFORE_THE_REGION : b > a.endTime ? c.AFTER_THE_REGION : c.IN_THE_REGION
        };
        shaka.media.RegionObserver.RelativePosition_ = {
            BEFORE_THE_REGION: 1,
            IN_THE_REGION: 2,
            AFTER_THE_REGION: 3
        };
        shaka.media.StreamingEngine = function(a, b) {
            this.playerInterface_ = b;
            this.manifest_ = a;
            this.config_ = null;
            this.bufferingGoalScale_ = 1;
            this.setupPeriodPromise_ = Promise.resolve();
            this.canSwitchPeriod_ = [];
            this.canSwitchStream_ = new Map;
            this.mediaStates_ = new Map;
            this.startupComplete_ = !1;
            this.failureCallbackBackoff_ = null;
            this.unloadingTextStream_ = this.destroyed_ = this.fatalError_ = !1;
            this.textStreamSequenceId_ = 0
        };
        shaka.media.StreamingEngine.APPEND_WINDOW_START_FUDGE_ = .1;
        shaka.media.StreamingEngine.APPEND_WINDOW_END_FUDGE_ = .01;
        shaka.media.StreamingEngine.MAX_RUN_AHEAD_SEGMENTS_ = 1;
        shaka.media.StreamingEngine.prototype.destroy = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            d = [];
                            for (var f = $jscomp.makeIterator(a.mediaStates_.values()), h = f.next(); !h.done; h = f.next()) e = h.value, a.cancelUpdate_(e), d.push(a.abortOperations_(e));
                            return c.yield(Promise.all(d), 2);
                        case 2:
                            a.mediaStates_.clear(), a.canSwitchStream_.clear(), a.playerInterface_ = null, a.manifest_ =
                                null, a.setupPeriodPromise_ = null, a.canSwitchPeriod_ = null, a.config_ = null, a.destroyed_ = !0, c.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.StreamingEngine.prototype.configure = function(a) {
            this.config_ = a;
            this.failureCallbackBackoff_ = new shaka.net.Backoff({
                maxAttempts: Math.max(a.retryParameters.maxAttempts, 2),
                baseDelay: a.retryParameters.baseDelay,
                backoffFactor: a.retryParameters.backoffFactor,
                fuzzFactor: a.retryParameters.fuzzFactor,
                timeout: 0
            }, !0)
        };
        shaka.media.StreamingEngine.prototype.start = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e, f;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return goog.asserts.assert(a.config_, "StreamingEngine configure() must be called before init()!"), d = a.playerInterface_.getPresentationTime(), e = a.findPeriodForTime_(d), f = a.playerInterface_.onChooseStreams(a.manifest_.periods[e]), f.variant || f.text ? c.yield(a.initStreams_(f.variant ?
                                f.variant.audio : null, f.variant ? f.variant.video : null, f.text, d), 2) : (shaka.log.error("init: no Streams chosen"), c["return"](new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STREAMING, shaka.util.Error.Code.INVALID_STREAMS_CHOSEN)));
                        case 2:
                            if (a.destroyed_) return c["return"]();
                            shaka.log.debug("init: completed initial Stream setup");
                            a.playerInterface_ && a.playerInterface_.onInitialStreamsSetup && (shaka.log.v1("init: calling onInitialStreamsSetup()..."), a.playerInterface_.onInitialStreamsSetup());
                            c.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.StreamingEngine.prototype.getBufferingPeriod = function() {
            var a = shaka.util.ManifestParserUtils.ContentType,
                b = this.mediaStates_.get(a.VIDEO);
            return b ? this.manifest_.periods[b.needPeriodIndex] : (a = this.mediaStates_.get(a.AUDIO)) ? this.manifest_.periods[a.needPeriodIndex] : null
        };
        shaka.media.StreamingEngine.prototype.getBufferingAudio = function() {
            return this.getStream_(shaka.util.ManifestParserUtils.ContentType.AUDIO)
        };
        shaka.media.StreamingEngine.prototype.getBufferingVideo = function() {
            return this.getStream_(shaka.util.ManifestParserUtils.ContentType.VIDEO)
        };
        shaka.media.StreamingEngine.prototype.getBufferingText = function() {
            return this.getStream_(shaka.util.ManifestParserUtils.ContentType.TEXT)
        };
        shaka.media.StreamingEngine.prototype.getStream_ = function(a) {
            return (a = this.mediaStates_.get(a)) ? a.restoreStreamAfterTrickPlay || a.stream : null
        };
        shaka.media.StreamingEngine.prototype.loadNewTextStream = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l, m, n, q, p;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return e = shaka.util.ManifestParserUtils.ContentType, d.yield(b.playerInterface_.mediaSourceEngine.clear(e.TEXT), 2);
                        case 2:
                            return b.textStreamSequenceId_++, b.unloadingTextStream_ = !1, f = b.textStreamSequenceId_, g = b.playerInterface_.mediaSourceEngine, h = new Map,
                                k = new Set, h.set(e.TEXT, a), k.add(a), d.yield(g.init(h, !1), 3);
                        case 3:
                            return b.destroyed_ ? d["return"]() : d.yield(b.setupStreams_(k), 4);
                        case 4:
                            if (b.destroyed_) return d["return"]();
                            m = (l = b.playerInterface_.mediaSourceEngine.getTextDisplayer().isTextVisible()) || b.config_.alwaysStreamText;
                            b.textStreamSequenceId_ != f || b.mediaStates_.has(e.TEXT) || b.unloadingTextStream_ || !m || (n = b.playerInterface_.getPresentationTime(), q = b.findPeriodForTime_(n), p = b.createMediaState_(a, q, 0), b.mediaStates_.set(e.TEXT, p), b.scheduleUpdate_(p,
                                0));
                            d.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.StreamingEngine.prototype.unloadTextStream = function() {
            var a = shaka.util.ManifestParserUtils.ContentType;
            this.unloadingTextStream_ = !0;
            var b = this.mediaStates_.get(a.TEXT);
            b && (this.cancelUpdate_(b), this.abortOperations_(b)["catch"](function() {}), this.mediaStates_["delete"](a.TEXT))
        };
        shaka.media.StreamingEngine.prototype.setTrickPlay = function(a) {
            var b = this.mediaStates_.get(shaka.util.ManifestParserUtils.ContentType.VIDEO);
            if (b) {
                var c = b.stream;
                if (c)
                    if (shaka.log.debug("setTrickPlay", a), a)(a = c.trickModeVideo) && !b.restoreStreamAfterTrickPlay && (shaka.log.debug("Engaging trick mode stream", a), this.switchInternal_(a, !1, 0, !1), b.restoreStreamAfterTrickPlay = c);
                    else if (c = b.restoreStreamAfterTrickPlay) shaka.log.debug("Restoring non-trick-mode stream", c), b.restoreStreamAfterTrickPlay = null,
                    this.switchInternal_(c, !0, 0, !1)
            }
        };
        shaka.media.StreamingEngine.prototype.switchVariant = function(a, b, c) {
            var d = !1;
            if (a.video) {
                var e = this.switchInternal_(a.video, b, c, !1);
                d = d || e
            }
            a.audio && (a = this.switchInternal_(a.audio, b, c, !1), d = d || a);
            return d
        };
        shaka.media.StreamingEngine.prototype.switchTextStream = function(a) {
            var b = shaka.util.ManifestParserUtils.ContentType;
            goog.asserts.assert(a && a.type == b.TEXT, "Wrong stream type passed to switchTextStream!");
            return this.switchInternal_(a, !0, 0, !1)
        };
        shaka.media.StreamingEngine.prototype.reloadTextStream = function() {
            var a = this.mediaStates_.get(shaka.util.ManifestParserUtils.ContentType.TEXT);
            a && this.switchInternal_(a.stream, !0, 0, !0)
        };
        shaka.media.StreamingEngine.prototype.switchInternal_ = function(a, b, c, d) {
            var e = this,
                f = shaka.util.ManifestParserUtils.ContentType,
                g = this.mediaStates_.get(a.type);
            if (!g && a.type == f.TEXT && this.config_.ignoreTextStreamFailures) return this.loadNewTextStream(a), !0;
            goog.asserts.assert(g, "switch: expected mediaState to exist");
            if (!g) return !1;
            var h = this.findPeriodContainingStream_(a),
                k = Array.from(this.mediaStates_.values()).every(function(a) {
                    return a.needPeriodIndex == g.needPeriodIndex
                });
            if (b && h != g.needPeriodIndex &&
                k) return shaka.log.debug("switch: switching to stream in another Period; clearing buffer and changing Periods"), this.mediaStates_.forEach(function(a) {
                e.forceClearBuffer_(a)
            }), !0;
            g.restoreStreamAfterTrickPlay && (shaka.log.debug("switch during trick play mode", a), a.trickModeVideo ? (g.restoreStreamAfterTrickPlay = a, a = a.trickModeVideo, shaka.log.debug("switch found trick play stream", a)) : (g.restoreStreamAfterTrickPlay = null, shaka.log.debug("switch found no special trick play stream")));
            k = this.canSwitchPeriod_[h];
            goog.asserts.assert(k && k.resolved, "switch: expected Period " + h + " to be ready");
            if (!k || !k.resolved) return !1;
            k = this.canSwitchStream_.get(a.id);
            goog.asserts.assert(k && k.resolved, "switch: expected Stream " + a.id + " to be ready");
            if (!k || !k.resolved) return !1;
            if (g.stream == a && !d) return b = shaka.media.StreamingEngine.logPrefix_(g), shaka.log.debug("switch: Stream " + b + " already active"), !1;
            a.type == f.TEXT && (d = shaka.util.MimeUtils.getFullType(a.mimeType, a.codecs), this.playerInterface_.mediaSourceEngine.reinitText(d));
            g.stream = a;
            g.needInitSegment = !0;
            a = shaka.media.StreamingEngine.logPrefix_(g);
            shaka.log.debug("switch: switching to Stream " + a);
            this.shouldAbortCurrentRequest_(g, h) && (shaka.log.info("Aborting current segment request to switch."), g.operation.abort());
            b && (g.clearingBuffer ? g.waitingToFlushBuffer = !0 : g.performingUpdate ? (g.waitingToClearBuffer = !0, g.clearBufferSafeMargin = c, g.waitingToFlushBuffer = !0) : (this.cancelUpdate_(g), this.clearBuffer_(g, !0, c)["catch"](function(a) {
                if (e.playerInterface_) e.playerInterface_.onError(a)
            })));
            return !0
        };
        shaka.media.StreamingEngine.prototype.shouldAbortCurrentRequest_ = function(a, b) {
            if (!a.operation) return !1;
            var c = this.playerInterface_.getPresentationTime(),
                d = this.playerInterface_.mediaSourceEngine.bufferEnd(a.type),
                e = this.getSegmentReferenceNeeded_(a, c, d, b),
                f = e ? e.getSize() : null;
            e && !f && (f = (e.getEndTime() - e.getStartTime()) * a.stream.bandwidth / 8);
            if (isNaN(f)) return !1;
            (e = a.stream.initSegmentReference) && (f += e.getSize() || 0);
            e = this.playerInterface_.getBandwidthEstimate();
            return 8 * f / e < d - c - Math.max(this.manifest_.minBufferTime || 0,
                this.config_.rebufferingGoal) || a.operation.getBytesRemaining() > f ? !0 : !1
        };
        shaka.media.StreamingEngine.prototype.seeked = function() {
            var a = this,
                b = shaka.util.Iterables,
                c = this.playerInterface_.getPresentationTime(),
                d = this.config_.smallGapLimit,
                e = function(b) {
                    return a.playerInterface_.mediaSourceEngine.isBuffered(b, c, d)
                },
                f = !1,
                g = this.findPeriodForTime_(c);
            if (b.every(this.mediaStates_.values(), function(a) {
                    return a.needPeriodIndex == g
                })) {
                b = $jscomp.makeIterator(this.mediaStates_.keys());
                for (var h = b.next(); !h.done; h = b.next()) h = h.value, e(h) || (this.forceClearBuffer_(this.mediaStates_.get(h)),
                    f = !0)
            } else b.every(this.mediaStates_.keys(), e) || (shaka.log.debug("(all): seeked: unbuffered seek: clearing all buffers"), this.mediaStates_.forEach(function(b) {
                a.forceClearBuffer_(b)
            }), f = !0);
            f || shaka.log.debug("(all): seeked: buffered seek: presentationTime=" + c)
        };
        shaka.media.StreamingEngine.prototype.forceClearBuffer_ = function(a) {
            var b = this,
                c = shaka.media.StreamingEngine.logPrefix_(a);
            a.clearingBuffer ? shaka.log.debug(c, "clear: already clearing the buffer") : a.waitingToClearBuffer ? shaka.log.debug(c, "clear: already waiting") : a.performingUpdate ? (shaka.log.debug(c, "clear: currently updating"), a.waitingToClearBuffer = !0, a.clearBufferSafeMargin = 0) : null == this.playerInterface_.mediaSourceEngine.bufferStart(a.type) ? (shaka.log.debug(c, "clear: nothing buffered"), null ==
                a.updateTimer && this.scheduleUpdate_(a, 0)) : (shaka.log.debug(c, "clear: handling right now"), this.cancelUpdate_(a), this.clearBuffer_(a, !1, 0)["catch"](function(a) {
                if (b.playerInterface_) b.playerInterface_.onError(a)
            }))
        };
        shaka.media.StreamingEngine.prototype.initStreams_ = function(a, b, c, d) {
            var e = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function g() {
                var h, k, l, m, n, q, p;
                return $jscomp.generator.createGenerator(g, function(g) {
                    switch (g.nextAddress) {
                        case 1:
                            return goog.asserts.assert(e.config_, "StreamingEngine configure() must be called before init()!"), h = e.playerInterface_.getPresentationTime(), k = e.findPeriodForTime_(h), l = shaka.util.ManifestParserUtils.ContentType, m = new Map, n = new Set, a && (m.set(l.AUDIO, a), n.add(a)),
                                b && (m.set(l.VIDEO, b), n.add(b)), c && (m.set(l.TEXT, c), n.add(c)), q = e.playerInterface_.mediaSourceEngine, p = e.config_.forceTransmuxTS, g.yield(q.init(m, p), 2);
                        case 2:
                            if (e.destroyed_) return g["return"]();
                            e.setDuration_();
                            return g.yield(e.setupStreams_(n), 3);
                        case 3:
                            if (e.destroyed_) return g["return"]();
                            m.forEach(function(a, b) {
                                if (!e.mediaStates_.has(b)) {
                                    var c = e.createMediaState_(a, k, d);
                                    e.mediaStates_.set(b, c);
                                    e.scheduleUpdate_(c, 0)
                                }
                            });
                            g.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.StreamingEngine.prototype.createMediaState_ = function(a, b, c) {
            return {
                stream: a,
                type: a.type,
                lastStream: null,
                lastSegmentReference: null,
                restoreStreamAfterTrickPlay: null,
                needInitSegment: !0,
                needPeriodIndex: b,
                endOfStream: !1,
                performingUpdate: !1,
                updateTimer: null,
                waitingToClearBuffer: !1,
                clearBufferSafeMargin: 0,
                waitingToFlushBuffer: !1,
                clearingBuffer: !1,
                recovering: !1,
                hasError: !1,
                resumeAt: c || 0,
                operation: null
            }
        };
        shaka.media.StreamingEngine.prototype.setupPeriod_ = function(a) {
            var b = this.canSwitchPeriod_[a];
            if (b) return shaka.log.debug("(all) Period " + a + " is being or has been set up"), goog.asserts.assert(b.promise, "promise must not be null"), b.promise;
            shaka.log.debug("(all) setting up Period " + a);
            b = {
                promise: new shaka.util.PublicPromise,
                resolved: !1
            };
            this.canSwitchPeriod_[a] = b;
            for (var c = new Set, d = $jscomp.makeIterator(this.manifest_.periods[a].variants), e = d.next(); !e.done; e = d.next()) e = e.value, e.video && c.add(e.video),
                e.video && e.video.trickModeVideo && c.add(e.video.trickModeVideo), e.audio && c.add(e.audio);
            d = $jscomp.makeIterator(this.manifest_.periods[a].textStreams);
            for (e = d.next(); !e.done; e = d.next()) c.add(e.value);
            this.setupPeriodPromise_ = this.setupPeriodPromise_.then(function() {
                if (!this.destroyed_) return this.setupStreams_(c)
            }.bind(this)).then(function() {
                this.destroyed_ || (this.canSwitchPeriod_[a].promise.resolve(), this.canSwitchPeriod_[a].resolved = !0, shaka.log.v1("(all) setup Period " + a))
            }.bind(this))["catch"](function(b) {
                this.destroyed_ ||
                    (this.canSwitchPeriod_[a].promise["catch"](function() {}), this.canSwitchPeriod_[a].promise.reject(), delete this.canSwitchPeriod_[a], shaka.log.warning("(all) failed to setup Period " + a), this.playerInterface_.onError(b))
            }.bind(this));
            return b.promise
        };
        shaka.media.StreamingEngine.prototype.setupStreams_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l, m;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            e = [];
                            for (var n = $jscomp.makeIterator(a), p = n.next(); !p.done; p = n.next()) f = p.value, (g = b.canSwitchStream_.get(f.id)) ? (shaka.log.debug("(all) Stream " + f.id + " is being or has been set up"), e.push(g.promise)) : (shaka.log.v1("(all) setting up Stream " + f.id), b.canSwitchStream_.set(f.id, {
                                promise: new shaka.util.PublicPromise,
                                resolved: !1
                            }), e.push(f.createSegmentIndex()));
                            d.setCatchFinallyBlocks(2);
                            return d.yield(Promise.all(e), 4);
                        case 4:
                            if (b.destroyed_) return d["return"]();
                            d.leaveTryBlock(3);
                            break;
                        case 2:
                            h = d.enterCatchBlock();
                            if (b.destroyed_) return d["return"]();
                            d = $jscomp.makeIterator(a);
                            for (p = d.next(); !p.done; p = d.next()) k = p.value, b.canSwitchStream_.get(k.id).promise["catch"](function() {}), b.canSwitchStream_.get(k.id).promise.reject(), b.canSwitchStream_["delete"](k.id);
                            throw h;
                        case 3:
                            n =
                                $jscomp.makeIterator(a);
                            for (p = n.next(); !p.done; p = n.next()) l = p.value, m = b.canSwitchStream_.get(l.id), m.resolved || (m.promise.resolve(), m.resolved = !0, shaka.log.v1("(all) setup Stream " + l.id));
                            d.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.StreamingEngine.prototype.setDuration_ = function() {
            var a = this.manifest_.presentationTimeline.getDuration();
            Infinity > a ? this.playerInterface_.mediaSourceEngine.setDuration(a) : this.playerInterface_.mediaSourceEngine.setDuration(Math.pow(2, 32))
        };
        shaka.media.StreamingEngine.prototype.onUpdate_ = function(a) {
            if (!this.destroyed_) {
                var b = shaka.media.StreamingEngine.logPrefix_(a);
                goog.asserts.assert(!a.performingUpdate && null != a.updateTimer, b + " unexpected call to onUpdate_()");
                if (!a.performingUpdate && null != a.updateTimer && (goog.asserts.assert(!a.clearingBuffer, b + " onUpdate_() should not be called when clearing the buffer"), !a.clearingBuffer))
                    if (a.updateTimer = null, a.waitingToClearBuffer) shaka.log.debug(b, "skipping update and clearing the buffer"), this.clearBuffer_(a,
                        a.waitingToFlushBuffer, a.clearBufferSafeMargin);
                    else {
                        try {
                            var c = this.update_(a);
                            null != c && (this.scheduleUpdate_(a, c), a.hasError = !1)
                        } catch (d) {
                            this.handleStreamingError_(d);
                            return
                        }
                        c = Array.from(this.mediaStates_.values());
                        this.handlePeriodTransition_(a);
                        this.startupComplete_ && c.every(function(a) {
                            return a.endOfStream
                        }) && (shaka.log.v1(b, "calling endOfStream()..."), this.playerInterface_.mediaSourceEngine.endOfStream().then(function() {
                            if (!this.destroyed_) {
                                var a = this.playerInterface_.mediaSourceEngine.getDuration();
                                0 != a && a < this.manifest_.presentationTimeline.getDuration() && this.manifest_.presentationTimeline.setDuration(a)
                            }
                        }.bind(this)))
                    }
            }
        };
        shaka.media.StreamingEngine.prototype.update_ = function(a) {
            var b = this;
            goog.asserts.assert(this.manifest_, "manifest_ should not be null");
            goog.asserts.assert(this.config_, "config_ should not be null");
            var c = shaka.util.ManifestParserUtils.ContentType;
            if (shaka.media.StreamingEngine.isEmbeddedText_(a)) return this.playerInterface_.mediaSourceEngine.setSelectedClosedCaptionId(a.stream.originalId || ""), null;
            var d = shaka.media.StreamingEngine.logPrefix_(a),
                e = this.playerInterface_.getPresentationTime(),
                f = this.getTimeNeeded_(a,
                    e);
            shaka.log.v2(d, "timeNeeded=" + f);
            var g = this.findPeriodContainingStream_(a.stream),
                h = this.findPeriodForTime_(f),
                k = this.playerInterface_.mediaSourceEngine.bufferedAheadOf(a.type, e);
            shaka.log.v2(d, "update_:", "presentationTime=" + e, "bufferedAhead=" + k);
            var l = Math.max(this.manifest_.minBufferTime || 0, this.config_.rebufferingGoal, this.config_.bufferingGoal) * this.bufferingGoalScale_;
            if (f >= this.manifest_.presentationTimeline.getDuration()) return shaka.log.debug(d, "buffered to end of presentation"), a.endOfStream = !0, a.type == c.VIDEO && (a = this.mediaStates_.get(c.TEXT)) && a.stream.mimeType == shaka.util.MimeUtils.CLOSED_CAPTION_MIMETYPE && (a.endOfStream = !0), null;
            a.endOfStream = !1;
            a.needPeriodIndex = h;
            if (h != g) return shaka.log.debug(d, "need Period " + h, "presentationTime=" + e, "timeNeeded=" + f, "currentPeriodIndex=" + g), null;
            if (k >= l) return shaka.log.v2(d, "buffering goal met"), .5;
            c = this.playerInterface_.mediaSourceEngine.bufferEnd(a.type);
            c = this.getSegmentReferenceNeeded_(a, e, c, g);
            if (!c) return 1;
            var m = Infinity;
            Array.from(this.mediaStates_.values()).forEach(function(a) {
                shaka.media.StreamingEngine.isEmbeddedText_(a) ||
                    (a = b.getTimeNeeded_(a, e), m = Math.min(m, a))
            });
            d = this.manifest_.presentationTimeline.getMaxSegmentDuration() * shaka.media.StreamingEngine.MAX_RUN_AHEAD_SEGMENTS_;
            if (f >= m + d) return 1;
            a.resumeAt = 0;
            this.fetchAndAppend_(a, e, g, c);
            return null
        };
        shaka.media.StreamingEngine.prototype.getTimeNeeded_ = function(a, b) {
            if (!a.lastStream || !a.lastSegmentReference) return Math.max(b, a.resumeAt);
            var c = this.findPeriodContainingStream_(a.lastStream);
            return this.manifest_.periods[c].startTime + a.lastSegmentReference.endTime
        };
        shaka.media.StreamingEngine.prototype.getSegmentReferenceNeeded_ = function(a, b, c, d) {
            var e = shaka.media.StreamingEngine.logPrefix_(a);
            if (a.lastSegmentReference && a.stream == a.lastStream) return c = a.lastSegmentReference.position + 1, shaka.log.v2(e, "next position known:", "position=" + c), this.getSegmentReferenceIfAvailable_(a, d, c);
            a.lastSegmentReference ? (goog.asserts.assert(a.lastStream, "lastStream should not be null"), shaka.log.v1(e, "next position unknown: another Stream buffered"), e = this.findPeriodContainingStream_(a.lastStream),
                e = this.lookupSegmentPosition_(a, this.manifest_.periods[e].startTime + a.lastSegmentReference.endTime, d)) : (goog.asserts.assert(!a.lastStream, "lastStream should be null"), shaka.log.v1(e, "next position unknown: nothing buffered"), e = this.lookupSegmentPosition_(a, c || b, d));
            if (null == e) return null;
            b = null;
            null == c && (b = this.getSegmentReferenceIfAvailable_(a, d, Math.max(0, e - 1)));
            return b || this.getSegmentReferenceIfAvailable_(a, d, e)
        };
        shaka.media.StreamingEngine.prototype.lookupSegmentPosition_ = function(a, b, c) {
            var d = shaka.media.StreamingEngine.logPrefix_(a);
            c = this.manifest_.periods[c];
            shaka.log.debug(d, "looking up segment:", "presentationTime=" + b, "currentPeriod.startTime=" + c.startTime);
            b = Math.max(0, b - c.startTime);
            a = a.stream.findSegmentPosition(b);
            null == a && shaka.log.warning(d, "cannot find segment:", "currentPeriod.startTime=" + c.startTime, "lookupTime=" + b);
            return a
        };
        shaka.media.StreamingEngine.prototype.getSegmentReferenceIfAvailable_ = function(a, b, c) {
            var d = shaka.media.StreamingEngine.logPrefix_(a);
            b = this.manifest_.periods[b];
            a = a.stream.getSegmentReference(c);
            if (!a) return shaka.log.v1(d, "segment does not exist:", "currentPeriod.startTime=" + b.startTime, "position=" + c), null;
            var e = this.manifest_.presentationTimeline;
            c = e.getSegmentAvailabilityStart();
            e = e.getSegmentAvailabilityEnd();
            return b.startTime + a.endTime < c || b.startTime + a.startTime > e ? (shaka.log.v2(d, "segment is not available:",
                "currentPeriod.startTime=" + b.startTime, "reference.startTime=" + a.startTime, "reference.endTime=" + a.endTime, "availabilityStart=" + c, "availabilityEnd=" + e), null) : a
        };
        shaka.media.StreamingEngine.prototype.fetchAndAppend_ = function(a, b, c, d) {
            var e = shaka.util.ManifestParserUtils.ContentType,
                f = shaka.media.StreamingEngine,
                g = f.logPrefix_(a),
                h = this.manifest_.periods[c];
            shaka.log.v1(g, "fetchAndAppend_:", "presentationTime=" + b, "currentPeriod.startTime=" + h.startTime, "reference.position=" + d.position, "reference.startTime=" + d.startTime, "reference.endTime=" + d.endTime);
            var k = a.stream,
                l = this.manifest_.presentationTimeline.getDuration(),
                m = this.manifest_.periods[c + 1],
                n = Math.max(0,
                    h.startTime - f.APPEND_WINDOW_START_FUDGE_);
            f = m ? m.startTime + f.APPEND_WINDOW_END_FUDGE_ : l;
            goog.asserts.assert(d.startTime <= f, g + " segment should start before append window end");
            c = this.initSourceBuffer_(a, c, n, f);
            a.performingUpdate = !0;
            a.needInitSegment = !1;
            shaka.log.v2(g, "fetching segment");
            n = this.fetch_(a, d);
            Promise.all([c, n]).then(function(c) {
                if (!this.destroyed_ && !this.fatalError_) return this.append_(a, b, h, k, d, c[1])
            }.bind(this)).then(function() {
                if (!this.destroyed_ && !this.fatalError_) {
                    a.performingUpdate = !1;
                    a.recovering = !1;
                    if (!a.waitingToClearBuffer) this.playerInterface_.onSegmentAppended();
                    this.scheduleUpdate_(a, 0);
                    this.handleStartup_(a, k);
                    shaka.log.v1(g, "finished fetch and append")
                }
            }.bind(this))["catch"](function(b) {
                this.destroyed_ || this.fatalError_ || (goog.asserts.assert(b instanceof shaka.util.Error, "Should only receive a Shaka error"), a.performingUpdate = !1, a.type == e.TEXT && this.config_.ignoreTextStreamFailures ? (b.code == shaka.util.Error.Code.BAD_HTTP_STATUS ? shaka.log.warning(g, "Text stream failed to download. Proceeding without it.") :
                    shaka.log.warning(g, "Text stream failed to parse. Proceeding without it."), this.mediaStates_["delete"](e.TEXT)) : b.code == shaka.util.Error.Code.OPERATION_ABORTED ? (a.performingUpdate = !1, a.updateTimer = null, this.scheduleUpdate_(a, 0)) : b.code == shaka.util.Error.Code.QUOTA_EXCEEDED_ERROR ? this.handleQuotaExceeded_(a, b) : (shaka.log.error(g, "failed fetch and append: code=" + b.code), a.hasError = !0, b.severity = shaka.util.Error.Severity.CRITICAL, this.handleStreamingError_(b)))
            }.bind(this))
        };
        shaka.media.StreamingEngine.prototype.retry = function() {
            if (this.destroyed_) return shaka.log.error("Unable to retry after StreamingEngine is destroyed!"), !1;
            if (this.fatalError_) return shaka.log.error("Unable to retry after StreamingEngine encountered a fatal error!"), !1;
            for (var a = $jscomp.makeIterator(this.mediaStates_.values()), b = a.next(); !b.done; b = a.next()) {
                b = b.value;
                var c = shaka.media.StreamingEngine.logPrefix_(b);
                b.hasError && (shaka.log.info(c, "Retrying after failure..."), b.hasError = !1, this.scheduleUpdate_(b,
                    .1))
            }
            return !0
        };
        shaka.media.StreamingEngine.prototype.handleQuotaExceeded_ = function(a, b) {
            var c = shaka.media.StreamingEngine.logPrefix_(a);
            if (Array.from(this.mediaStates_.values()).some(function(b) {
                    return b != a && b.recovering
                })) shaka.log.debug(c, "MediaSource threw QuotaExceededError:", "waiting for another stream to recover...");
            else {
                var d = Math.round(100 * this.bufferingGoalScale_);
                if (20 < d) this.bufferingGoalScale_ -= .2;
                else if (4 < d) this.bufferingGoalScale_ -= .04;
                else {
                    shaka.log.error(c, "MediaSource threw QuotaExceededError too many times");
                    this.fatalError_ =
                        a.hasError = !0;
                    this.playerInterface_.onError(b);
                    return
                }
                shaka.log.warning(c, "MediaSource threw QuotaExceededError:", "reducing buffering goals by " + (100 - Math.round(100 * this.bufferingGoalScale_)) + "%");
                a.recovering = !0
            }
            this.scheduleUpdate_(a, 4)
        };
        shaka.media.StreamingEngine.prototype.initSourceBuffer_ = function(a, b, c, d) {
            if (!a.needInitSegment) return Promise.resolve();
            var e = shaka.media.StreamingEngine.logPrefix_(a);
            b = this.manifest_.periods[b].startTime - a.stream.presentationTimeOffset;
            shaka.log.v1(e, "setting timestamp offset to " + b);
            shaka.log.v1(e, "setting append window start to " + c);
            shaka.log.v1(e, "setting append window end to " + d);
            c = this.playerInterface_.mediaSourceEngine.setStreamProperties(a.type, b, c, d);
            if (!a.stream.initSegmentReference) return c;
            shaka.log.v1(e, "fetching init segment");
            d = this.fetch_(a, a.stream.initSegmentReference).then(function(b) {
                if (!this.destroyed_) return shaka.log.v1(e, "appending init segment"), this.playerInterface_.mediaSourceEngine.appendBuffer(a.type, b, null, null, a.stream.closedCaptions && 0 < a.stream.closedCaptions.size)
            }.bind(this))["catch"](function(b) {
                a.needInitSegment = !0;
                return Promise.reject(b)
            });
            return Promise.all([c, d])
        };
        shaka.media.StreamingEngine.prototype.append_ = function(a, b, c, d, e, f) {
            var g = shaka.media.StreamingEngine.logPrefix_(a),
                h = d.closedCaptions && 0 < d.closedCaptions.size;
            null != d.emsgSchemeIdUris && 0 < d.emsgSchemeIdUris.length && (new shaka.util.Mp4Parser).fullBox("emsg", this.parseEMSG_.bind(this, c, e, d.emsgSchemeIdUris)).parse(f);
            return this.evict_(a, b).then(function() {
                if (!this.destroyed_) return shaka.log.v1(g, "appending media segment"), this.playerInterface_.mediaSourceEngine.appendBuffer(a.type, f, e.startTime + c.startTime,
                    e.endTime + c.startTime, h)
            }.bind(this)).then(function() {
                if (!this.destroyed_) return shaka.log.v2(g, "appended media segment"), a.lastStream = d, a.lastSegmentReference = e, Promise.resolve()
            }.bind(this))
        };
        shaka.media.StreamingEngine.prototype.parseEMSG_ = function(a, b, c, d) {
            var e = d.reader.readTerminatedString(),
                f = d.reader.readTerminatedString(),
                g = d.reader.readUint32(),
                h = d.reader.readUint32(),
                k = d.reader.readUint32(),
                l = d.reader.readUint32();
            d = d.reader.readBytes(d.reader.getLength() - d.reader.getPosition());
            a = a.startTime + b.startTime + h / g;
            if (c.includes(e))
                if ("urn:mpeg:dash:event:2012" == e) this.playerInterface_.onManifestUpdate();
                else c = new shaka.util.FakeEvent("emsg", {
                    detail: {
                        startTime: a,
                        endTime: a + k / g,
                        schemeIdUri: e,
                        value: f,
                        timescale: g,
                        presentationTimeDelta: h,
                        eventDuration: k,
                        id: l,
                        messageData: d
                    }
                }), this.playerInterface_.onEvent(c)
        };
        shaka.media.StreamingEngine.prototype.evict_ = function(a, b) {
            var c = shaka.media.StreamingEngine.logPrefix_(a);
            shaka.log.v2(c, "checking buffer length");
            var d = Math.max(this.config_.bufferBehind, this.manifest_.presentationTimeline.getMaxSegmentDuration()),
                e = this.playerInterface_.mediaSourceEngine.bufferStart(a.type);
            if (null == e) return shaka.log.v2(c, "buffer behind okay because nothing buffered:", "presentationTime=" + b, "bufferBehind=" + d), Promise.resolve();
            var f = b - e,
                g = f - d;
            if (.01 >= g) return shaka.log.v2(c, "buffer behind okay:",
                "presentationTime=" + b, "bufferedBehind=" + f, "bufferBehind=" + d, "underflow=" + Math.abs(g)), Promise.resolve();
            shaka.log.v1(c, "buffer behind too large:", "presentationTime=" + b, "bufferedBehind=" + f, "bufferBehind=" + d, "overflow=" + g);
            return this.playerInterface_.mediaSourceEngine.remove(a.type, e, e + g).then(function() {
                this.destroyed_ || shaka.log.v1(c, "evicted " + g + " seconds")
            }.bind(this))
        };
        shaka.media.StreamingEngine.prototype.handleStartup_ = function(a, b) {
            var c = shaka.util.Functional,
                d = shaka.util.ManifestParserUtils.ContentType;
            if (!this.startupComplete_) {
                var e = shaka.media.StreamingEngine.logPrefix_(a),
                    f = Array.from(this.mediaStates_.values());
                if (1 != f.length || f[0].type != d.TEXT) this.startupComplete_ = f.every(function(a) {
                    return a.type == d.TEXT ? !0 : !a.waitingToClearBuffer && !a.clearingBuffer && a.lastSegmentReference
                });
                if (this.startupComplete_) {
                    shaka.log.debug(e, "startup complete");
                    var g = this.findPeriodContainingStream_(b);
                    goog.asserts.assert(f.every(function(a) {
                        return a.needPeriodIndex == g || a.needPeriodIndex == g + 1
                    }), e + " expected all MediaStates to need same Period");
                    this.canSwitchPeriod_[g] || this.setupPeriod_(g).then(function() {
                        this.destroyed_ || (shaka.log.v1(e, "calling onCanSwitch()..."), this.playerInterface_.onCanSwitch())
                    }.bind(this))["catch"](c.noop);
                    for (f = 0; f < this.manifest_.periods.length; ++f) this.setupPeriod_(f)["catch"](c.noop);
                    this.playerInterface_.onStartupComplete && (shaka.log.v1(e, "calling onStartupComplete()..."),
                        this.playerInterface_.onStartupComplete())
                }
            }
        };
        shaka.media.StreamingEngine.prototype.handlePeriodTransition_ = function(a) {
            var b = shaka.util.Functional,
                c = shaka.media.StreamingEngine.logPrefix_(a),
                d = shaka.util.ManifestParserUtils.ContentType,
                e = this.findPeriodContainingStream_(a.stream);
            if (a.needPeriodIndex != e) {
                var f = a.needPeriodIndex,
                    g = Array.from(this.mediaStates_.values());
                goog.asserts.assert(g.every(function(a) {
                    return a.needPeriodIndex == f || a.hasError || !shaka.media.StreamingEngine.isIdle_(a) || shaka.media.StreamingEngine.isEmbeddedText_(a)
                }), "All MediaStates should need the same Period or be performing updates.");
                g.every(function(a) {
                    return a.needPeriodIndex == f || shaka.media.StreamingEngine.isEmbeddedText_(a)
                }) ? g.every(shaka.media.StreamingEngine.isIdle_) ? (shaka.log.debug(c, "all need Period " + f), this.setupPeriod_(f).then(function() {
                    if (!this.destroyed_)
                        if (g.every(function(a) {
                                var b = shaka.media.StreamingEngine.isIdle_(a),
                                    c = this.findPeriodContainingStream_(a.stream);
                                return shaka.media.StreamingEngine.isEmbeddedText_(a) ? !0 : b && a.needPeriodIndex == f && c != f
                            }.bind(this))) {
                            var a = this.manifest_.periods[f];
                            shaka.log.v1(c,
                                "calling onChooseStreams()...");
                            var b = this.playerInterface_.onChooseStreams(a),
                                e = new Map;
                            b.variant && b.variant.video && e.set(d.VIDEO, b.variant.video);
                            b.variant && b.variant.audio && e.set(d.AUDIO, b.variant.audio);
                            b.text && e.set(d.TEXT, b.text);
                            b = $jscomp.makeIterator(this.mediaStates_.keys());
                            for (var m = b.next(); !m.done; m = b.next())
                                if (m = m.value, !e.has(m) && m != d.TEXT) {
                                    shaka.log.error(c, "invalid Streams chosen: missing " + m + " Stream");
                                    this.playerInterface_.onError(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                                        shaka.util.Error.Category.STREAMING, shaka.util.Error.Code.INVALID_STREAMS_CHOSEN));
                                    return
                                } b = $jscomp.makeIterator(Array.from(e.keys()));
                            for (m = b.next(); !m.done; m = b.next())
                                if (m = m.value, !this.mediaStates_.has(m))
                                    if (m == d.TEXT) this.initStreams_(null, null, e.get(d.TEXT), a.startTime), e["delete"](m);
                                    else {
                                        shaka.log.error(c, "invalid Streams chosen: unusable " + m + " Stream");
                                        this.playerInterface_.onError(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STREAMING, shaka.util.Error.Code.INVALID_STREAMS_CHOSEN));
                                        return
                                    } b = $jscomp.makeIterator(Array.from(this.mediaStates_.keys()));
                            for (m = b.next(); !m.done; m = b.next()) {
                                m = m.value;
                                var n = this.mediaStates_.get(m),
                                    q = e.get(m);
                                if (q) {
                                    var p = shaka.media.StreamingEngine.isEmbeddedText_(n);
                                    p && (n.needPeriodIndex = f, n.resumeAt = a.startTime);
                                    this.switchInternal_(q, !1, 0, !1);
                                    p && shaka.media.StreamingEngine.isEmbeddedText_(n) || this.scheduleUpdate_(this.mediaStates_.get(m), 0)
                                } else goog.asserts.assert(m == d.TEXT, "Invalid streams chosen"), this.mediaStates_["delete"](m)
                            }
                            shaka.log.v1(c,
                                "calling onCanSwitch()...");
                            this.playerInterface_.onCanSwitch()
                        } else shaka.log.debug(c, "ignoring transition to Period", f, "since another is happening")
                }.bind(this))["catch"](b.noop)) : shaka.log.debug(c, "all MediaStates need Period " + f + ", but not all MediaStates are idle") : shaka.log.debug(c, "not all MediaStates need Period " + f)
            }
        };
        shaka.media.StreamingEngine.isEmbeddedText_ = function(a) {
            var b = shaka.util.MimeUtils;
            return a && a.type == shaka.util.ManifestParserUtils.ContentType.TEXT && a.stream.mimeType == b.CLOSED_CAPTION_MIMETYPE
        };
        shaka.media.StreamingEngine.isIdle_ = function(a) {
            return !a.performingUpdate && null == a.updateTimer && !a.waitingToClearBuffer && !a.clearingBuffer
        };
        shaka.media.StreamingEngine.prototype.findPeriodForTime_ = function(a) {
            return (a = shaka.util.Periods.findPeriodForTime(this.manifest_.periods, a + shaka.util.ManifestParserUtils.GAP_OVERLAP_TOLERANCE_SECONDS)) ? this.manifest_.periods.indexOf(a) : 0
        };
        shaka.media.StreamingEngine.prototype.findPeriodContainingStream_ = function(a) {
            goog.asserts.assert(this.manifest_, "Must have a manifest to find a stream.");
            for (var b = this.manifest_.periods, c = 0; c < b.length; c++) {
                for (var d = b[c], e = new Set, f = $jscomp.makeIterator(d.variants), g = f.next(); !g.done; g = f.next()) g = g.value, g.audio && e.add(g.audio), g.video && e.add(g.video), g.video && g.video.trickModeVideo && e.add(g.video.trickModeVideo);
                d = $jscomp.makeIterator(d.textStreams);
                for (f = d.next(); !f.done; f = d.next()) e.add(f.value);
                if (e.has(a)) return c
            }
            return -1
        };
        shaka.media.StreamingEngine.prototype.fetch_ = function(a, b) {
            var c = shaka.net.NetworkingEngine.RequestType.SEGMENT,
                d = shaka.util.Networking.createSegmentRequest(b.getUris(), b.startByte, b.endByte, this.config_.retryParameters);
            shaka.log.v2("fetching: reference=", b);
            c = this.playerInterface_.netEngine.request(c, d);
            a.operation = c;
            return c.promise.then(function(b) {
                a.operation = null;
                return b.data
            })
        };
        shaka.media.StreamingEngine.prototype.clearBuffer_ = function(a, b, c) {
            var d = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                var g, h, k, l;
                return $jscomp.generator.createGenerator(f, function(f) {
                    switch (f.nextAddress) {
                        case 1:
                            return g = shaka.media.StreamingEngine.logPrefix_(a), goog.asserts.assert(!a.performingUpdate && null == a.updateTimer, g + " unexpected call to clearBuffer_()"), a.waitingToClearBuffer = !1, a.waitingToFlushBuffer = !1, a.clearBufferSafeMargin = 0, a.clearingBuffer = !0, a.lastStream =
                                null, a.lastSegmentReference = null, shaka.log.debug(g, "clearing buffer"), c ? (k = d.playerInterface_.getPresentationTime(), l = d.playerInterface_.mediaSourceEngine.getDuration(), h = d.playerInterface_.mediaSourceEngine.remove(a.type, k + c, l)) : h = d.playerInterface_.mediaSourceEngine.clear(a.type).then(function() {
                                    if (!this.destroyed_ && b) return this.playerInterface_.mediaSourceEngine.flush(a.type)
                                }.bind(d)), f.yield(h, 2);
                        case 2:
                            if (d.destroyed_) return f["return"]();
                            shaka.log.debug(g, "cleared buffer");
                            a.clearingBuffer = !1;
                            a.endOfStream = !1;
                            d.scheduleUpdate_(a, 0);
                            f.jumpToEnd()
                    }
                })
            })
        };
        shaka.media.StreamingEngine.prototype.scheduleUpdate_ = function(a, b) {
            var c = this,
                d = shaka.media.StreamingEngine.logPrefix_(a),
                e = a.type;
            e != shaka.util.ManifestParserUtils.ContentType.TEXT || this.mediaStates_.has(e) ? (shaka.log.v2(d, "updating in " + b + " seconds"), goog.asserts.assert(null == a.updateTimer, d + " did not expect update to be scheduled"), a.updateTimer = (new shaka.util.DelayedTick(function() {
                return $jscomp.asyncExecutePromiseGeneratorFunction(function g() {
                    var b;
                    return $jscomp.generator.createGenerator(g,
                        function(d) {
                            switch (d.nextAddress) {
                                case 1:
                                    return d.setCatchFinallyBlocks(2), d.yield(c.onUpdate_(a), 4);
                                case 4:
                                    d.leaveTryBlock(0);
                                    break;
                                case 2:
                                    b = d.enterCatchBlock();
                                    if (c.playerInterface_) c.playerInterface_.onError(b);
                                    d.jumpToEnd()
                            }
                        })
                })
            })).tickAfter(b)) : shaka.log.v1(d, "Text stream is unloaded. No update is needed.")
        };
        shaka.media.StreamingEngine.prototype.cancelUpdate_ = function(a) {
            null != a.updateTimer && (a.updateTimer.stop(), a.updateTimer = null)
        };
        shaka.media.StreamingEngine.prototype.abortOperations_ = function(a) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            if (a.operation) return c.yield(a.operation.abort(), 0);
                            c.jumpTo(0)
                    }
                })
            })
        };
        shaka.media.StreamingEngine.prototype.handleStreamingError_ = function(a) {
            this.failureCallbackBackoff_.attempt().then(function() {
                this.destroyed_ || (this.playerInterface_.onError(a), a.handled || this.config_.failureCallback(a))
            }.bind(this))
        };
        shaka.media.StreamingEngine.logPrefix_ = function(a) {
            return "(" + a.type + ":" + a.stream.id + ")"
        };
        shaka.net.HttpPluginUtils = {};
        shaka.net.HttpPluginUtils.makeResponse = function(a, b, c, d, e, f) {
            if (200 <= c && 299 >= c && 202 != c) return {
                uri: e || d,
                originalUri: d,
                data: b,
                headers: a,
                fromCache: !!a["x-shaka-from-cache"]
            };
            e = null;
            try {
                e = shaka.util.StringUtils.fromBytesAutoDetect(b)
            } catch (g) {}
            shaka.log.debug("HTTP error text:", e);
            throw new shaka.util.Error(401 == c || 403 == c ? shaka.util.Error.Severity.CRITICAL : shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.BAD_HTTP_STATUS, d, c, e, a, f);
        };
        shaka.net.HttpFetchPlugin = function(a, b, c, d) {
            var e = new shaka.net.HttpFetchPlugin.Headers_;
            shaka.util.MapUtils.asMap(b.headers).forEach(function(a, b) {
                e.append(b, a)
            });
            var f = new shaka.net.HttpFetchPlugin.AbortController_,
                g = {
                    canceled: !1,
                    timedOut: !1
                };
            a = shaka.net.HttpFetchPlugin.request_(a, c, {
                body: b.body || void 0,
                headers: e,
                method: b.method,
                signal: f.signal,
                credentials: b.allowCrossSiteCredentials ? "include" : void 0
            }, g, d);
            a = new shaka.util.AbortableOperation(a, function() {
                g.canceled = !0;
                f.abort();
                return Promise.resolve()
            });
            if (b = b.retryParameters.timeout) {
                var h = new shaka.util.Timer(function() {
                    g.timedOut = !0;
                    f.abort()
                });
                h.tickAfter(b / 1E3);
                a["finally"](function() {
                    h.stop()
                })
            }
            return a
        };
        goog.exportSymbol("shaka.net.HttpFetchPlugin", shaka.net.HttpFetchPlugin);
        shaka.net.HttpFetchPlugin.request_ = function(a, b, c, d, e) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function g() {
                var h, k, l, m, n, q, p, t, r, v, u, y, w, x;
                return $jscomp.generator.createGenerator(g, function(g) {
                    switch (g.nextAddress) {
                        case 1:
                            return h = shaka.net.HttpFetchPlugin.fetch_, k = shaka.net.HttpFetchPlugin.ReadableStream_, q = n = 0, p = Date.now(), g.setCatchFinallyBlocks(2), g.yield(h(a, c), 4);
                        case 4:
                            return l = g.yieldResult, t = l.clone().body.getReader(), v = (r = l.headers.get("Content-Length")) ? parseInt(r, 10) : 0, u =
                                function(a) {
                                    var b = function() {
                                        return $jscomp.asyncExecutePromiseGeneratorFunction(function z() {
                                            var c, d, g;
                                            return $jscomp.generator.createGenerator(z, function(h) {
                                                switch (h.nextAddress) {
                                                    case 1:
                                                        return h.setCatchFinallyBlocks(2), h.yield(t.read(), 4);
                                                    case 4:
                                                        c = h.yieldResult;
                                                        h.leaveTryBlock(3);
                                                        break;
                                                    case 2:
                                                        return d = h.enterCatchBlock(), shaka.log.v1("error reading from stream", d.message), h["return"]();
                                                    case 3:
                                                        c.done || (n += c.value.byteLength);
                                                        g = Date.now();
                                                        if (100 < g - p || c.done) e(g - p, n - q, v - n), q = n, p = g;
                                                        c.done ? (goog.asserts.assert(!c.value,
                                                            'readObj should be unset when "done" is true.'), a.close()) : (a.enqueue(c.value), b());
                                                        h.jumpToEnd()
                                                }
                                            })
                                        })
                                    };
                                    b()
                                }, new k({
                                    start: u
                                }), g.yield(l.arrayBuffer(), 5);
                        case 5:
                            m = g.yieldResult;
                            g.leaveTryBlock(3);
                            break;
                        case 2:
                            y = g.enterCatchBlock();
                            if (d.canceled) throw new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.OPERATION_ABORTED, a, b);
                            if (d.timedOut) throw new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.NETWORK,
                                shaka.util.Error.Code.TIMEOUT, a, b);
                            throw new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.HTTP_ERROR, a, y, b);
                        case 3:
                            return w = {}, x = l.headers, x.forEach(function(a, b) {
                                w[b.trim()] = a
                            }), g["return"](shaka.net.HttpPluginUtils.makeResponse(w, m, l.status, a, l.url, b))
                    }
                })
            })
        };
        shaka.net.HttpFetchPlugin.isSupported = function() {
            if (window.ReadableStream) try {
                new ReadableStream({})
            } catch (a) {
                return !1
            } else return !1;
            return !(!window.fetch || !window.AbortController)
        };
        goog.exportProperty(shaka.net.HttpFetchPlugin, "isSupported", shaka.net.HttpFetchPlugin.isSupported);
        shaka.net.HttpFetchPlugin.fetch_ = window.fetch;
        shaka.net.HttpFetchPlugin.AbortController_ = window.AbortController;
        shaka.net.HttpFetchPlugin.ReadableStream_ = window.ReadableStream;
        shaka.net.HttpFetchPlugin.Headers_ = window.Headers;
        shaka.net.HttpFetchPlugin.isSupported() && (shaka.net.NetworkingEngine.registerScheme("http", shaka.net.HttpFetchPlugin, shaka.net.NetworkingEngine.PluginPriority.PREFERRED), shaka.net.NetworkingEngine.registerScheme("https", shaka.net.HttpFetchPlugin, shaka.net.NetworkingEngine.PluginPriority.PREFERRED));
        shaka.net.HttpXHRPlugin = function(a, b, c, d) {
            var e = new shaka.net.HttpXHRPlugin.Xhr_,
                f = Date.now(),
                g = 0,
                h = new Promise(function(h, l) {
                    e.open(b.method, a, !0);
                    e.responseType = "arraybuffer";
                    e.timeout = b.retryParameters.timeout;
                    e.withCredentials = b.allowCrossSiteCredentials;
                    e.onabort = function() {
                        l(new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.OPERATION_ABORTED, a, c))
                    };
                    e.onload = function(b) {
                        b = b.target;
                        goog.asserts.assert(b, "XHR onload has no target!");
                        var d = b.getAllResponseHeaders().trim().split("\r\n"),
                            e = {};
                        d = $jscomp.makeIterator(d);
                        for (var f = d.next(); !f.done; f = d.next()) f = f.value.split(": "), e[f[0].toLowerCase()] = f.slice(1).join(": ");
                        try {
                            var g = shaka.net.HttpPluginUtils.makeResponse(e, b.response, b.status, a, b.responseURL, c);
                            h(g)
                        } catch (u) {
                            goog.asserts.assert(u instanceof shaka.util.Error, "Wrong error type!"), l(u)
                        }
                    };
                    e.onerror = function(b) {
                        l(new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.HTTP_ERROR,
                            a, b, c))
                    };
                    e.ontimeout = function(b) {
                        l(new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.TIMEOUT, a, c))
                    };
                    e.onprogress = function(a) {
                        var b = Date.now();
                        if (100 < b - f || a.lengthComputable && a.loaded == a.total) d(b - f, a.loaded - g, a.total - a.loaded), g = a.loaded, f = b
                    };
                    for (var k in b.headers) {
                        var n = k.toLowerCase();
                        e.setRequestHeader(n, b.headers[k])
                    }
                    e.send(b.body)
                });
            return new shaka.util.AbortableOperation(h, function() {
                e.abort();
                return Promise.resolve()
            })
        };
        goog.exportSymbol("shaka.net.HttpXHRPlugin", shaka.net.HttpXHRPlugin);
        shaka.net.HttpXHRPlugin.Xhr_ = window.XMLHttpRequest;
        shaka.net.NetworkingEngine.registerScheme("http", shaka.net.HttpXHRPlugin, shaka.net.NetworkingEngine.PluginPriority.FALLBACK);
        shaka.net.NetworkingEngine.registerScheme("https", shaka.net.HttpXHRPlugin, shaka.net.NetworkingEngine.PluginPriority.FALLBACK);
        shaka.offline = {};
        shaka.offline.DownloadProgressEstimator = function() {
            this.actualDownloaded_ = this.estimatedDownloaded_ = this.estimatedTotal_ = 0;
            this.pending_ = new Map;
            this.nextId_ = 0
        };
        shaka.offline.DownloadProgressEstimator.prototype.open = function(a) {
            this.estimatedTotal_ += a;
            var b = this.nextId_;
            this.nextId_++;
            this.pending_.set(b, a);
            return b
        };
        shaka.offline.DownloadProgressEstimator.prototype.close = function(a, b) {
            if (this.pending_.has(a)) {
                var c = this.pending_.get(a);
                this.pending_["delete"](a);
                this.estimatedDownloaded_ += c;
                this.actualDownloaded_ += b
            }
        };
        shaka.offline.DownloadProgressEstimator.prototype.getEstimatedProgress = function() {
            return 0 == this.estimatedTotal_ ? 0 : this.estimatedDownloaded_ / this.estimatedTotal_
        };
        shaka.offline.DownloadProgressEstimator.prototype.getTotalDownloaded = function() {
            return this.actualDownloaded_
        };
        shaka.offline.DownloadManager = function(a, b, c) {
            this.networkingEngine_ = a;
            this.groups_ = new Map;
            this.destroyed_ = !1;
            this.onProgress_ = b;
            this.onInitData_ = c;
            this.estimator_ = new shaka.offline.DownloadProgressEstimator
        };
        shaka.offline.DownloadManager.prototype.destroy = function() {
            this.destroyed_ = !0;
            return Promise.all(this.groups_.values()).then(function() {}, function() {})
        };
        shaka.offline.DownloadManager.prototype.queue = function(a, b, c, d, e) {
            var f = this;
            goog.asserts.assert(!this.destroyed_, "Do not call |queue| after |destroy|");
            var g = this.estimator_.open(c);
            c = this.groups_.get(a) || Promise.resolve();
            this.groups_.set(a, c.then(function() {
                return $jscomp.asyncExecutePromiseGeneratorFunction(function k() {
                    var a, c, n, q, p, t;
                    return $jscomp.generator.createGenerator(k, function(k) {
                        switch (k.nextAddress) {
                            case 1:
                                return k.yield(f.fetchSegment_(b), 2);
                            case 2:
                                a = k.yieldResult;
                                if (f.destroyed_) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                                    shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.OPERATION_ABORTED);
                                if (d) {
                                    c = new Uint8Array(a);
                                    n = new shaka.util.Pssh(c);
                                    for (var l in n.data) q = Number(l), p = n.data[q], t = n.systemIds[q], f.onInitData_(p, t)
                                }
                                f.estimator_.close(g, a.byteLength);
                                f.onProgress_(f.estimator_.getEstimatedProgress(), f.estimator_.getTotalDownloaded());
                                return k["return"](e(a))
                        }
                    })
                })
            }))
        };
        shaka.offline.DownloadManager.prototype.waitToFinish = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return c.yield(Promise.all(a.groups_.values()), 2);
                        case 2:
                            return c["return"](a.estimator_.getTotalDownloaded())
                    }
                })
            })
        };
        shaka.offline.DownloadManager.prototype.fetchSegment_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return e = shaka.net.NetworkingEngine.RequestType.SEGMENT, f = b.networkingEngine_.request(e, a), d.yield(f.promise, 2);
                        case 2:
                            return g = d.yieldResult, goog.asserts.assert(g.data, "Response data should be non-null!"), d["return"](g.data)
                    }
                })
            })
        };
        shaka.offline.indexeddb = {};
        shaka.offline.indexeddb.DBOperation = function(a, b) {
            var c = this;
            this.transaction_ = a;
            this.store_ = a.objectStore(b);
            this.promise_ = new shaka.util.PublicPromise;
            a.onabort = function(a) {
                a.preventDefault();
                c.promise_.reject()
            };
            a.onerror = function(a) {
                a.preventDefault();
                c.promise_.reject()
            };
            a.oncomplete = function(a) {
                c.promise_.resolve()
            }
        };
        shaka.offline.indexeddb.DBOperation.prototype.abort = function() {
            try {
                this.transaction_.abort()
            } catch (a) {}
            return this.promise_["catch"](function() {})
        };
        shaka.offline.indexeddb.DBOperation.prototype.forEachEntry = function(a) {
            var b = this;
            return new Promise(function(c, d) {
                var e = b.store_.openCursor();
                e.onerror = d;
                e.onsuccess = function(b) {
                    b = b.target.result;
                    if (!b) return c();
                    a(b.key, b.value, b);
                    b["continue"]()
                }
            })
        };
        shaka.offline.indexeddb.DBOperation.prototype.store = function() {
            return this.store_
        };
        shaka.offline.indexeddb.DBOperation.prototype.promise = function() {
            return this.promise_
        };
        shaka.offline.indexeddb.DBConnection = function(a) {
            this.connection_ = a;
            this.pending_ = []
        };
        shaka.offline.indexeddb.DBConnection.prototype.destroy = function() {
            return Promise.all(this.pending_.map(function(a) {
                return a.abort()
            }))
        };
        shaka.offline.indexeddb.DBConnection.prototype.startReadOnlyOperation = function(a) {
            return this.startOperation_(a, "readonly")
        };
        shaka.offline.indexeddb.DBConnection.prototype.startReadWriteOperation = function(a) {
            return this.startOperation_(a, "readwrite")
        };
        shaka.offline.indexeddb.DBConnection.prototype.startOperation_ = function(a, b) {
            var c = this,
                d = this.connection_.transaction([a], b),
                e = new shaka.offline.indexeddb.DBOperation(d, a);
            this.pending_.push(e);
            e.promise().then(function() {
                return c.stopTracking_(e)
            }, function() {
                return c.stopTracking_(e)
            });
            return e
        };
        shaka.offline.indexeddb.DBConnection.prototype.stopTracking_ = function(a) {
            shaka.util.ArrayUtils.remove(this.pending_, a)
        };
        shaka.offline.indexeddb.BaseStorageCell = function(a, b, c) {
            this.connection_ = new shaka.offline.indexeddb.DBConnection(a);
            this.segmentStore_ = b;
            this.manifestStore_ = c
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.destroy = function() {
            return this.connection_.destroy()
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.hasFixedKeySpace = function() {
            return !0
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.addSegments = function(a) {
            return this.rejectAdd(this.segmentStore_)
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.removeSegments = function(a, b) {
            return this.remove_(this.segmentStore_, a, b)
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.getSegments = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return d.yield(b.get_(b.segmentStore_, a), 2);
                        case 2:
                            return e = d.yieldResult, d["return"](e.map(function(a) {
                                return b.convertSegmentData(a)
                            }))
                    }
                })
            })
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.addManifests = function(a) {
            return this.rejectAdd(this.manifestStore_)
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.updateManifestExpiration = function(a, b) {
            var c = this.connection_.startReadWriteOperation(this.manifestStore_),
                d = c.store();
            d.get(a).onsuccess = function(c) {
                if (c = c.target.result) c.expiration = b, d.put(c, a)
            };
            return c.promise()
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.removeManifests = function(a, b) {
            return this.remove_(this.manifestStore_, a, b)
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.getManifests = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return d.yield(b.get_(b.manifestStore_, a), 2);
                        case 2:
                            return e = d.yieldResult, d["return"](e.map(function(a) {
                                return b.convertManifest(a)
                            }))
                    }
                })
            })
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.getAllManifests = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return d = a.connection_.startReadOnlyOperation(a.manifestStore_), e = new Map, c.yield(d.forEachEntry(function(c, d) {
                                e.set(c, a.convertManifest(d))
                            }), 2);
                        case 2:
                            return c.yield(d.promise(), 3);
                        case 3:
                            return c["return"](e)
                    }
                })
            })
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.convertSegmentData = function(a) {
            return a
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.convertManifest = function(a) {
            return a
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.rejectAdd = function(a) {
            return Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.NEW_KEY_OPERATION_NOT_SUPPORTED, "Cannot add new value to " + a))
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.add = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            f = c.connection_.startReadWriteOperation(a);
                            g = f.store();
                            h = [];
                            for (var m = $jscomp.makeIterator(b), q = m.next(); !q.done; q = m.next()) k = q.value, l = g.add(k), l.onsuccess = function(a) {
                                h.push(a.target.result)
                            };
                            return e.yield(f.promise(), 2);
                        case 2:
                            return e["return"](h)
                    }
                })
            })
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.remove_ = function(a, b, c) {
            a = this.connection_.startReadWriteOperation(a);
            var d = a.store(),
                e = {};
            b = $jscomp.makeIterator(b);
            for (var f = b.next(); !f.done; e = {
                    key: e.key
                }, f = b.next()) e.key = f.value, d["delete"](e.key).onsuccess = function(a) {
                return function() {
                    return c(a.key)
                }
            }(e);
            return a.promise()
        };
        shaka.offline.indexeddb.BaseStorageCell.prototype.get_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l, m, n;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            f = c.connection_.startReadOnlyOperation(a);
                            g = f.store();
                            h = {};
                            k = [];
                            l = {};
                            m = $jscomp.makeIterator(b);
                            for (n = m.next(); !n.done; l = {
                                    request: l.request,
                                    key: l.key
                                }, n = m.next()) l.key = n.value, l.request = g.get(l.key), l.request.onsuccess = function(a) {
                                return function() {
                                    void 0 ==
                                        a.request.result && k.push(a.key);
                                    h[a.key] = a.request.result
                                }
                            }(l);
                            return e.yield(f.promise(), 2);
                        case 2:
                            if (k.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.KEY_NOT_FOUND, "Could not find values for " + k);
                            return e["return"](b.map(function(a) {
                                return h[a]
                            }))
                    }
                })
            })
        };
        shaka.offline.indexeddb.EmeSessionStorageCell = function(a, b) {
            this.connection_ = new shaka.offline.indexeddb.DBConnection(a);
            this.store_ = b
        };
        shaka.offline.indexeddb.EmeSessionStorageCell.prototype.destroy = function() {
            return this.connection_.destroy()
        };
        shaka.offline.indexeddb.EmeSessionStorageCell.prototype.getAll = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return d = a.connection_.startReadOnlyOperation(a.store_), e = [], c.yield(d.forEachEntry(function(a, c) {
                                e.push(c)
                            }), 2);
                        case 2:
                            return c.yield(d.promise(), 3);
                        case 3:
                            return c["return"](e)
                    }
                })
            })
        };
        shaka.offline.indexeddb.EmeSessionStorageCell.prototype.add = function(a) {
            var b = this.connection_.startReadWriteOperation(this.store_),
                c = b.store();
            a = $jscomp.makeIterator(a);
            for (var d = a.next(); !d.done; d = a.next()) c.add(d.value);
            return b.promise()
        };
        shaka.offline.indexeddb.EmeSessionStorageCell.prototype.remove = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return e = b.connection_.startReadWriteOperation(b.store_), d.yield(e.forEachEntry(function(b, d, e) {
                                0 <= a.indexOf(d.sessionId) && e["delete"]()
                            }), 2);
                        case 2:
                            return d.yield(e.promise(), 0)
                    }
                })
            })
        };
        shaka.offline.StorageMuxer = function() {
            this.mechanisms_ = new Map
        };
        shaka.offline.StorageMuxer.prototype.destroy = function() {
            for (var a = [], b = $jscomp.makeIterator(this.mechanisms_.values()), c = b.next(); !c.done; c = b.next()) a.push(c.value.destroy());
            this.mechanisms_.clear();
            return Promise.all(a)
        };
        shaka.offline.StorageMuxer.prototype.init = function() {
            var a = this;
            shaka.offline.StorageMuxer.getRegistry_().forEach(function(b, c) {
                var d = b();
                d ? a.mechanisms_.set(c, d) : shaka.log.info("Skipping " + c + " as it is not supported on this platform")
            });
            for (var b = [], c = $jscomp.makeIterator(this.mechanisms_.values()), d = c.next(); !d.done; d = c.next()) b.push(d.value.init());
            return Promise.all(b)
        };
        shaka.offline.StorageMuxer.prototype.getActive = function() {
            var a = null;
            this.mechanisms_.forEach(function(b, c) {
                b.getCells().forEach(function(b, e) {
                    b.hasFixedKeySpace() || a || (a = {
                        path: {
                            mechanism: c,
                            cell: e
                        },
                        cell: b
                    })
                })
            });
            if (a) return a;
            throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.MISSING_STORAGE_CELL, "Could not find a cell that supports add-operations");
        };
        shaka.offline.StorageMuxer.prototype.forEachCell = function(a) {
            this.mechanisms_.forEach(function(b, c) {
                b.getCells().forEach(function(b, e) {
                    a({
                        mechanism: c,
                        cell: e
                    }, b)
                })
            })
        };
        shaka.offline.StorageMuxer.prototype.getCell = function(a, b) {
            var c = this.mechanisms_.get(a);
            if (!c) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.MISSING_STORAGE_CELL, "Could not find mechanism with name " + a);
            c = c.getCells().get(b);
            if (!c) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.MISSING_STORAGE_CELL, "Could not find cell with name " + b);
            return c
        };
        shaka.offline.StorageMuxer.prototype.forEachEmeSessionCell = function(a) {
            this.mechanisms_.forEach(function(b) {
                a(b.getEmeSessionCell())
            })
        };
        shaka.offline.StorageMuxer.prototype.getEmeSessionCell = function() {
            var a = Array.from(this.mechanisms_.keys());
            if (!a.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.STORAGE_NOT_SUPPORTED, "No supported storage mechanisms found");
            return this.mechanisms_.get(a[0]).getEmeSessionCell()
        };
        shaka.offline.StorageMuxer.prototype.resolvePath = function(a) {
            var b = this.mechanisms_.get(a.mechanism);
            return b ? b.getCells().get(a.cell) : null
        };
        shaka.offline.StorageMuxer.prototype.erase = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e, f;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return d = Array.from(a.mechanisms_.values()), e = 0 < d.length, e || (f = shaka.offline.StorageMuxer.getRegistry_(), f.forEach(function(a, c) {
                                var e = a();
                                e && d.push(e)
                            })), c.yield(Promise.all(d.map(function(a) {
                                return a.erase()
                            })), 2);
                        case 2:
                            if (e) c.jumpTo(0);
                            else return c.yield(Promise.all(d.map(function(a) {
                                    return a.destroy()
                                })),
                                0)
                    }
                })
            })
        };
        shaka.offline.StorageMuxer.register = function(a, b) {
            shaka.offline.StorageMuxer.registry_.set(a, b)
        };
        goog.exportSymbol("shaka.offline.StorageMuxer.register", shaka.offline.StorageMuxer.register);
        shaka.offline.StorageMuxer.unregister = function(a) {
            shaka.offline.StorageMuxer.registry_["delete"](a)
        };
        goog.exportSymbol("shaka.offline.StorageMuxer.unregister", shaka.offline.StorageMuxer.unregister);
        shaka.offline.StorageMuxer.support = function() {
            var a = shaka.offline.StorageMuxer.getRegistry_();
            a = $jscomp.makeIterator(a.values());
            for (var b = a.next(); !b.done; b = a.next())
                if (b = b.value, b = b()) return b.destroy(), !0;
            return !1
        };
        shaka.offline.StorageMuxer.overrideSupport = function(a) {
            shaka.offline.StorageMuxer.override_ = a
        };
        shaka.offline.StorageMuxer.clearOverride = function() {
            shaka.offline.StorageMuxer.override_ = null
        };
        shaka.offline.StorageMuxer.getRegistry_ = function() {
            var a = shaka.offline.StorageMuxer.override_,
                b = shaka.offline.StorageMuxer.registry_;
            return COMPILED ? b : a || b
        };
        shaka.offline.StorageMuxer.override_ = null;
        shaka.offline.StorageMuxer.registry_ = new Map;
        shaka.offline.indexeddb.V1StorageCell = function(a) {
            shaka.offline.indexeddb.BaseStorageCell.apply(this, arguments)
        };
        $jscomp.inherits(shaka.offline.indexeddb.V1StorageCell, shaka.offline.indexeddb.BaseStorageCell);
        shaka.offline.indexeddb.V1StorageCell.prototype.updateManifestExpiration = function(a, b) {
            var c = this.connection_.startReadWriteOperation(this.manifestStore_),
                d = c.store(),
                e = new shaka.util.PublicPromise;
            d.get(a).onsuccess = function(c) {
                (c = c.target.result) ? (goog.asserts.assert(c.key == a, "With in-line keys, the keys should match"), c.expiration = b, d.put(c), e.resolve()) : e.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.KEY_NOT_FOUND, "Could not find values for " +
                    a))
            };
            return c.promise().then(function() {
                return e
            })
        };
        shaka.offline.indexeddb.V1StorageCell.prototype.convertManifest = function(a) {
            return {
                originalManifestUri: a.originalManifestUri,
                duration: a.duration,
                size: a.size,
                expiration: null == a.expiration ? Infinity : a.expiration,
                periods: a.periods.map(shaka.offline.indexeddb.V1StorageCell.convertPeriod_),
                sessionIds: a.sessionIds,
                drmInfo: a.drmInfo,
                appMetadata: a.appMetadata
            }
        };
        shaka.offline.indexeddb.V1StorageCell.convertPeriod_ = function(a) {
            var b = shaka.offline.indexeddb.V1StorageCell;
            b.fillMissingVariants_(a);
            a.streams.forEach(function(a) {
                goog.asserts.assert(a.variantIds, "After filling in missing variants, each stream should have variant ids")
            });
            return {
                startTime: a.startTime,
                streams: a.streams.map(b.convertStream_)
            }
        };
        shaka.offline.indexeddb.V1StorageCell.convertStream_ = function(a) {
            var b = shaka.offline.indexeddb.V1StorageCell,
                c = a.initSegmentUri ? b.getKeyFromSegmentUri_(a.initSegmentUri) : null;
            return {
                id: a.id,
                originalId: null,
                primary: a.primary,
                presentationTimeOffset: a.presentationTimeOffset,
                contentType: a.contentType,
                mimeType: a.mimeType,
                codecs: a.codecs,
                frameRate: a.frameRate,
                pixelAspectRatio: void 0,
                kind: a.kind,
                language: a.language,
                label: a.label,
                width: a.width,
                height: a.height,
                initSegmentKey: c,
                encrypted: a.encrypted,
                keyId: a.keyId,
                segments: a.segments.map(b.convertSegment_),
                variantIds: a.variantIds
            }
        };
        shaka.offline.indexeddb.V1StorageCell.convertSegment_ = function(a) {
            var b = shaka.offline.indexeddb.V1StorageCell.getKeyFromSegmentUri_(a.uri);
            return {
                startTime: a.startTime,
                endTime: a.endTime,
                dataKey: b
            }
        };
        shaka.offline.indexeddb.V1StorageCell.prototype.convertSegmentData = function(a) {
            return {
                data: a.data
            }
        };
        shaka.offline.indexeddb.V1StorageCell.getKeyFromSegmentUri_ = function(a) {
            var b;
            if ((b = /^offline:[0-9]+\/[0-9]+\/([0-9]+)$/.exec(a)) || (b = /^offline:segment\/([0-9]+)$/.exec(a))) return Number(b[1]);
            throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.MALFORMED_OFFLINE_URI, "Could not parse uri " + a);
        };
        shaka.offline.indexeddb.V1StorageCell.fillMissingVariants_ = function(a) {
            var b = shaka.util.ManifestParserUtils.ContentType.AUDIO,
                c = shaka.util.ManifestParserUtils.ContentType.VIDEO,
                d = a.streams.filter(function(a) {
                    return a.contentType == b
                }),
                e = a.streams.filter(function(a) {
                    return a.contentType == c
                });
            if (!d.every(function(a) {
                    return a.variantIds
                }) || !e.every(function(a) {
                    return a.variantIds
                })) {
                goog.asserts.assert(d.every(function(a) {
                    return !a.variantIds
                }), "Some audio streams have variant ids and some do not.");
                goog.asserts.assert(e.every(function(a) {
                        return !a.variantIds
                    }),
                    "Some video streams have variant ids and some do not.");
                d.forEach(function(a) {
                    a.variantIds = []
                });
                e.forEach(function(a) {
                    a.variantIds = []
                });
                var f = 0;
                if (e.length && !d.length) {
                    shaka.log.debug("Found video-only content. Creating variants for video.");
                    var g = f++;
                    e.forEach(function(a) {
                        a.variantIds.push(g)
                    })
                }
                if (!e.length && d.length) {
                    shaka.log.debug("Found audio-only content. Creating variants for audio.");
                    var h = f++;
                    d.forEach(function(a) {
                        a.variantIds.push(h)
                    })
                }
                e.length && d.length && (shaka.log.debug("Found audio-video content. Creating variants."),
                    d.forEach(function(a) {
                        e.forEach(function(b) {
                            var c = f++;
                            a.variantIds.push(c);
                            b.variantIds.push(c)
                        })
                    }))
            }
        };
        shaka.offline.indexeddb.V2StorageCell = function(a, b, c, d) {
            shaka.offline.indexeddb.BaseStorageCell.call(this, a, b, c);
            this.isFixedKey_ = d
        };
        $jscomp.inherits(shaka.offline.indexeddb.V2StorageCell, shaka.offline.indexeddb.BaseStorageCell);
        shaka.offline.indexeddb.V2StorageCell.prototype.hasFixedKeySpace = function() {
            return this.isFixedKey_
        };
        shaka.offline.indexeddb.V2StorageCell.prototype.addSegments = function(a) {
            return this.isFixedKey_ ? this.rejectAdd(this.segmentStore_) : this.add(this.segmentStore_, a)
        };
        shaka.offline.indexeddb.V2StorageCell.prototype.addManifests = function(a) {
            return this.isFixedKey_ ? this.rejectAdd(this.manifestStore_) : this.add(this.manifestStore_, a)
        };
        shaka.offline.indexeddb.V2StorageCell.prototype.convertManifest = function(a) {
            null == a.expiration && (a.expiration = Infinity);
            return a
        };
        shaka.offline.indexeddb.StorageMechanism = function() {
            this.sessions_ = this.v3_ = this.v2_ = this.v1_ = this.db_ = null
        };
        shaka.offline.indexeddb.StorageMechanism.prototype.init = function() {
            var a = this,
                b = shaka.offline.indexeddb.StorageMechanism.DB_NAME,
                c = shaka.offline.indexeddb.StorageMechanism.VERSION,
                d = new shaka.util.PublicPromise,
                e = window.indexedDB.open(b, c);
            e.onsuccess = function(b) {
                b = b.target.result;
                a.db_ = b;
                a.v1_ = shaka.offline.indexeddb.StorageMechanism.createV1_(b);
                a.v2_ = shaka.offline.indexeddb.StorageMechanism.createV2_(b);
                a.v3_ = shaka.offline.indexeddb.StorageMechanism.createV3_(b);
                a.sessions_ = shaka.offline.indexeddb.StorageMechanism.createEmeSession_(b);
                d.resolve()
            };
            e.onupgradeneeded = function(b) {
                a.createStores_(b.target.result)
            };
            e.onerror = function(a) {
                d.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.INDEXED_DB_ERROR, e.error));
                a.preventDefault()
            };
            return d
        };
        shaka.offline.indexeddb.StorageMechanism.prototype.destroy = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            if (!a.v1_) {
                                c.jumpTo(2);
                                break
                            }
                            return c.yield(a.v1_.destroy(), 2);
                        case 2:
                            if (!a.v2_) {
                                c.jumpTo(4);
                                break
                            }
                            return c.yield(a.v2_.destroy(), 4);
                        case 4:
                            if (!a.v3_) {
                                c.jumpTo(6);
                                break
                            }
                            return c.yield(a.v3_.destroy(), 6);
                        case 6:
                            if (!a.sessions_) {
                                c.jumpTo(8);
                                break
                            }
                            return c.yield(a.sessions_.destroy(),
                                8);
                        case 8:
                            a.db_ && a.db_.close(), c.jumpToEnd()
                    }
                })
            })
        };
        shaka.offline.indexeddb.StorageMechanism.prototype.getCells = function() {
            var a = new Map;
            this.v1_ && a.set("v1", this.v1_);
            this.v2_ && a.set("v2", this.v2_);
            this.v3_ && a.set("v3", this.v3_);
            return a
        };
        shaka.offline.indexeddb.StorageMechanism.prototype.getEmeSessionCell = function() {
            goog.asserts.assert(this.sessions_, "Cannot be destroyed.");
            return this.sessions_
        };
        shaka.offline.indexeddb.StorageMechanism.prototype.erase = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            if (!a.v1_) {
                                c.jumpTo(2);
                                break
                            }
                            return c.yield(a.v1_.destroy(), 2);
                        case 2:
                            if (!a.v2_) {
                                c.jumpTo(4);
                                break
                            }
                            return c.yield(a.v2_.destroy(), 4);
                        case 4:
                            if (!a.v3_) {
                                c.jumpTo(6);
                                break
                            }
                            return c.yield(a.v3_.destroy(), 6);
                        case 6:
                            return a.db_ && a.db_.close(), c.yield(shaka.offline.indexeddb.StorageMechanism.deleteAll_(),
                                8);
                        case 8:
                            return a.db_ = null, a.v1_ = null, a.v2_ = null, a.v3_ = null, c.yield(a.init(), 0)
                    }
                })
            })
        };
        shaka.offline.indexeddb.StorageMechanism.createV1_ = function(a) {
            var b = shaka.offline.indexeddb.StorageMechanism,
                c = b.V1_SEGMENT_STORE;
            b = b.V1_MANIFEST_STORE;
            var d = a.objectStoreNames;
            return d.contains(b) && d.contains(c) ? (shaka.log.debug("Mounting v1 idb storage cell"), new shaka.offline.indexeddb.V1StorageCell(a, c, b)) : null
        };
        shaka.offline.indexeddb.StorageMechanism.createV2_ = function(a) {
            var b = shaka.offline.indexeddb.StorageMechanism,
                c = b.V2_SEGMENT_STORE;
            b = b.V2_MANIFEST_STORE;
            var d = a.objectStoreNames;
            return d.contains(b) && d.contains(c) ? (shaka.log.debug("Mounting v2 idb storage cell"), new shaka.offline.indexeddb.V2StorageCell(a, c, b, !0)) : null
        };
        shaka.offline.indexeddb.StorageMechanism.createV3_ = function(a) {
            var b = shaka.offline.indexeddb.StorageMechanism,
                c = b.V3_SEGMENT_STORE;
            b = b.V3_MANIFEST_STORE;
            var d = a.objectStoreNames;
            return d.contains(b) && d.contains(c) ? (shaka.log.debug("Mounting v3 idb storage cell"), new shaka.offline.indexeddb.V2StorageCell(a, c, b, !1)) : null
        };
        shaka.offline.indexeddb.StorageMechanism.createEmeSession_ = function(a) {
            var b = shaka.offline.indexeddb.StorageMechanism.SESSION_ID_STORE;
            return a.objectStoreNames.contains(b) ? (shaka.log.debug("Mounting session ID idb storage cell"), new shaka.offline.indexeddb.EmeSessionStorageCell(a, b)) : null
        };
        shaka.offline.indexeddb.StorageMechanism.prototype.createStores_ = function(a) {
            for (var b = $jscomp.makeIterator([shaka.offline.indexeddb.StorageMechanism.V3_SEGMENT_STORE, shaka.offline.indexeddb.StorageMechanism.V3_MANIFEST_STORE, shaka.offline.indexeddb.StorageMechanism.SESSION_ID_STORE]), c = b.next(); !c.done; c = b.next()) c = c.value, a.objectStoreNames.contains(c) || a.createObjectStore(c, {
                autoIncrement: !0
            })
        };
        shaka.offline.indexeddb.StorageMechanism.deleteAll_ = function() {
            var a = shaka.offline.indexeddb.StorageMechanism.DB_NAME,
                b = new shaka.util.PublicPromise,
                c = window.indexedDB.deleteDatabase(a);
            c.onblocked = function(b) {
                shaka.log.warning("Deleting", a, "is being blocked")
            };
            c.onsuccess = function(a) {
                b.resolve()
            };
            c.onerror = function(a) {
                b.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.INDEXED_DB_ERROR, c.error));
                a.preventDefault()
            };
            return b
        };
        shaka.offline.indexeddb.StorageMechanism.DB_NAME = "shaka_offline_db";
        shaka.offline.indexeddb.StorageMechanism.VERSION = 4;
        shaka.offline.indexeddb.StorageMechanism.V1_SEGMENT_STORE = "segment";
        shaka.offline.indexeddb.StorageMechanism.V2_SEGMENT_STORE = "segment-v2";
        shaka.offline.indexeddb.StorageMechanism.V3_SEGMENT_STORE = "segment-v3";
        shaka.offline.indexeddb.StorageMechanism.V1_MANIFEST_STORE = "manifest";
        shaka.offline.indexeddb.StorageMechanism.V2_MANIFEST_STORE = "manifest-v2";
        shaka.offline.indexeddb.StorageMechanism.V3_MANIFEST_STORE = "manifest-v3";
        shaka.offline.indexeddb.StorageMechanism.SESSION_ID_STORE = "session-ids";
        shaka.offline.StorageMuxer.register("idb", function() {
            return shaka.util.Platform.isChromecast() || !window.indexedDB ? null : new shaka.offline.indexeddb.StorageMechanism
        });
        shaka.offline.OfflineUri = function(a, b, c, d) {
            this.type_ = a;
            this.mechanism_ = b;
            this.cell_ = c;
            this.key_ = d;
            this.asString_ = ["offline:", a, "/", b, "/", c, "/", d].join("")
        };
        shaka.offline.OfflineUri.prototype.isManifest = function() {
            return "manifest" == this.type_
        };
        shaka.offline.OfflineUri.prototype.isSegment = function() {
            return "segment" == this.type_
        };
        shaka.offline.OfflineUri.prototype.mechanism = function() {
            return this.mechanism_
        };
        shaka.offline.OfflineUri.prototype.cell = function() {
            return this.cell_
        };
        shaka.offline.OfflineUri.prototype.key = function() {
            return this.key_
        };
        shaka.offline.OfflineUri.prototype.toString = function() {
            return this.asString_
        };
        shaka.offline.OfflineUri.parse = function(a) {
            a = /^offline:([a-z]+)\/([^/]+)\/([^/]+)\/([0-9]+)$/.exec(a);
            if (null == a) return null;
            var b = a[1];
            if ("manifest" != b && "segment" != b) return null;
            var c = a[2];
            if (!c) return null;
            var d = a[3];
            return d && null != b ? new shaka.offline.OfflineUri(b, c, d, Number(a[4])) : null
        };
        shaka.offline.OfflineUri.manifest = function(a, b, c) {
            return new shaka.offline.OfflineUri("manifest", a, b, c)
        };
        shaka.offline.OfflineUri.segment = function(a, b, c) {
            return new shaka.offline.OfflineUri("segment", a, b, c)
        };
        shaka.offline.ManifestConverter = function(a, b) {
            this.mechanism_ = a;
            this.cell_ = b
        };
        shaka.offline.ManifestConverter.prototype.fromManifestDB = function(a) {
            var b = this,
                c = new shaka.media.PresentationTimeline(null, 0);
            c.setDuration(a.duration);
            var d = a.periods.map(function(a) {
                    return b.fromPeriodDB(a, c)
                }),
                e = a.drmInfo ? [a.drmInfo] : [];
            a.drmInfo && d.forEach(function(a) {
                a.variants.forEach(function(a) {
                    a.drmInfos = e
                })
            });
            return {
                presentationTimeline: c,
                minBufferTime: 2,
                offlineSessionIds: a.sessionIds,
                periods: d
            }
        };
        shaka.offline.ManifestConverter.prototype.fromPeriodDB = function(a, b) {
            var c = this,
                d = a.streams.filter(function(a) {
                    return c.isAudio_(a)
                }),
                e = a.streams.filter(function(a) {
                    return c.isVideo_(a)
                });
            d = this.createVariants(d, e);
            e = a.streams.filter(function(a) {
                return c.isText_(a)
            }).map(function(a) {
                return c.fromStreamDB_(a)
            });
            a.streams.forEach(function(d, e) {
                var f = d.segments.map(function(a, b) {
                    return c.fromSegmentDB_(b, a)
                });
                b.notifySegments(f, a.startTime)
            });
            return {
                startTime: a.startTime,
                variants: Array.from(d.values()),
                textStreams: e
            }
        };
        shaka.offline.ManifestConverter.prototype.createVariants = function(a, b) {
            for (var c = new Set, d = $jscomp.makeIterator(a), e = d.next(); !e.done; e = d.next()) {
                var f = $jscomp.makeIterator(e.value.variantIds);
                for (e = f.next(); !e.done; e = f.next()) c.add(e.value)
            }
            d = $jscomp.makeIterator(b);
            for (e = d.next(); !e.done; e = d.next())
                for (f = $jscomp.makeIterator(e.value.variantIds), e = f.next(); !e.done; e = f.next()) c.add(e.value);
            d = new Map;
            c = $jscomp.makeIterator(c);
            for (e = c.next(); !e.done; e = c.next()) e = e.value, d.set(e, this.createEmptyVariant_(e));
            c =
                $jscomp.makeIterator(a);
            for (e = c.next(); !e.done; e = c.next()) {
                e = e.value;
                f = this.fromStreamDB_(e);
                var g = $jscomp.makeIterator(e.variantIds);
                for (e = g.next(); !e.done; e = g.next()) e = d.get(e.value), goog.asserts.assert(!e.audio, "A variant should only have one audio stream"), e.language = f.language, e.primary = e.primary || f.primary, e.audio = f
            }
            c = $jscomp.makeIterator(b);
            for (e = c.next(); !e.done; e = c.next())
                for (e = e.value, f = this.fromStreamDB_(e), g = $jscomp.makeIterator(e.variantIds), e = g.next(); !e.done; e = g.next()) e = d.get(e.value),
                    goog.asserts.assert(!e.video, "A variant should only have one video stream"), e.primary = e.primary || f.primary, e.video = f;
            return d
        };
        shaka.offline.ManifestConverter.prototype.fromStreamDB_ = function(a) {
            var b = this,
                c = a.segments.map(function(a, c) {
                    return b.fromSegmentDB_(c, a)
                }),
                d = new shaka.media.SegmentIndex(c);
            c = {
                id: a.id,
                originalId: a.originalId,
                createSegmentIndex: function() {
                    return Promise.resolve()
                },
                findSegmentPosition: function(a) {
                    return d.find(a)
                },
                getSegmentReference: function(a) {
                    return d.get(a)
                },
                initSegmentReference: null,
                presentationTimeOffset: a.presentationTimeOffset,
                mimeType: a.mimeType,
                codecs: a.codecs,
                width: a.width || void 0,
                height: a.height ||
                    void 0,
                frameRate: a.frameRate || void 0,
                pixelAspectRatio: a.pixelAspectRatio || void 0,
                kind: a.kind,
                encrypted: a.encrypted,
                keyId: a.keyId,
                language: a.language,
                label: a.label || null,
                type: a.contentType,
                primary: a.primary,
                trickModeVideo: null,
                emsgSchemeIdUris: null,
                roles: [],
                channelsCount: null,
                audioSamplingRate: null,
                closedCaptions: null
            };
            null != a.initSegmentKey && (c.initSegmentReference = this.fromInitSegmentDB_(a.initSegmentKey));
            return c
        };
        shaka.offline.ManifestConverter.prototype.fromSegmentDB_ = function(a, b) {
            var c = shaka.offline.OfflineUri.segment(this.mechanism_, this.cell_, b.dataKey);
            return new shaka.media.SegmentReference(a, b.startTime, b.endTime, function() {
                return [c.toString()]
            }, 0, null)
        };
        shaka.offline.ManifestConverter.prototype.fromInitSegmentDB_ = function(a) {
            var b = shaka.offline.OfflineUri.segment(this.mechanism_, this.cell_, a);
            return new shaka.media.InitSegmentReference(function() {
                return [b.toString()]
            }, 0, null)
        };
        shaka.offline.ManifestConverter.prototype.isAudio_ = function(a) {
            return a.contentType == shaka.util.ManifestParserUtils.ContentType.AUDIO
        };
        shaka.offline.ManifestConverter.prototype.isVideo_ = function(a) {
            return a.contentType == shaka.util.ManifestParserUtils.ContentType.VIDEO
        };
        shaka.offline.ManifestConverter.prototype.isText_ = function(a) {
            return a.contentType == shaka.util.ManifestParserUtils.ContentType.TEXT
        };
        shaka.offline.ManifestConverter.prototype.createEmptyVariant_ = function(a) {
            return {
                id: a,
                language: "",
                primary: !1,
                audio: null,
                video: null,
                bandwidth: 0,
                drmInfos: [],
                allowedByApplication: !0,
                allowedByKeySystem: !0
            }
        };
        shaka.offline.OfflineManifestParser = function() {
            this.uri_ = null
        };
        shaka.offline.OfflineManifestParser.prototype.configure = function(a) {};
        shaka.offline.OfflineManifestParser.prototype.start = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var b, g, h, k, l, m;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            b = shaka.offline.OfflineUri.parse(a);
                            c.uri_ = b;
                            if (null == b || !b.isManifest()) return e["return"](Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.MALFORMED_OFFLINE_URI, b)));
                            g = new shaka.offline.StorageMuxer;
                            e.setFinallyBlock(2);
                            return e.yield(g.init(), 4);
                        case 4:
                            return e.yield(g.getCell(b.mechanism(), b.cell()), 5);
                        case 5:
                            return h = e.yieldResult, e.yield(h.getManifests([b.key()]), 6);
                        case 6:
                            return k = e.yieldResult, l = k[0], m = new shaka.offline.ManifestConverter(b.mechanism(), b.cell()), e["return"](m.fromManifestDB(l));
                        case 2:
                            return e.enterFinallyBlock(), e.yield(g.destroy(), 7);
                        case 7:
                            e.leaveFinallyBlock(0)
                    }
                })
            })
        };
        shaka.offline.OfflineManifestParser.prototype.stop = function() {
            return Promise.resolve()
        };
        shaka.offline.OfflineManifestParser.prototype.update = function() {};
        shaka.offline.OfflineManifestParser.prototype.onExpirationUpdated = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l, m, n, q;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return goog.asserts.assert(c.uri_, "Should not get update event before start has been called"), f = c.uri_, g = new shaka.offline.StorageMuxer, e.setCatchFinallyBlocks(2, 3), e.yield(g.init(), 5);
                        case 5:
                            return e.yield(g.getCell(f.mechanism(), f.cell()),
                                6);
                        case 6:
                            return h = e.yieldResult, e.yield(h.getManifests([f.key()]), 7);
                        case 7:
                            k = e.yieldResult;
                            l = k[0];
                            m = l.sessionIds.includes(a);
                            n = void 0 == l.expiration || l.expiration > b;
                            if (!m || !n) {
                                e.jumpTo(3);
                                break
                            }
                            shaka.log.debug("Updating expiration for stored content");
                            return e.yield(h.updateManifestExpiration(f.key(), b), 3);
                        case 3:
                            return e.enterFinallyBlock(), e.yield(g.destroy(), 10);
                        case 10:
                            e.leaveFinallyBlock(0);
                            break;
                        case 2:
                            q = e.enterCatchBlock(), shaka.log.error("There was an error updating", f, q), e.jumpTo(3)
                    }
                })
            })
        };
        shaka.media.ManifestParser.registerParserByMime("application/x-offline-manifest", shaka.offline.OfflineManifestParser);
        shaka.offline.OfflineScheme = function(a, b, c, d) {
            return (b = shaka.offline.OfflineUri.parse(a)) && b.isManifest() ? shaka.offline.OfflineScheme.getManifest_(a) : b && b.isSegment() ? shaka.offline.OfflineScheme.getSegment_(b.key(), b) : shaka.util.AbortableOperation.failed(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.NETWORK, shaka.util.Error.Code.MALFORMED_OFFLINE_URI, a))
        };
        goog.exportSymbol("shaka.offline.OfflineScheme", shaka.offline.OfflineScheme);
        shaka.offline.OfflineScheme.getManifest_ = function(a) {
            a = {
                uri: a,
                originalUri: a,
                data: new ArrayBuffer(0),
                headers: {
                    "content-type": "application/x-offline-manifest"
                }
            };
            return shaka.util.AbortableOperation.completed(a)
        };
        shaka.offline.OfflineScheme.getSegment_ = function(a, b) {
            goog.asserts.assert(b.isSegment(), "Only segment uri's should be given to getSegment");
            var c = new shaka.offline.StorageMuxer;
            return shaka.util.AbortableOperation.completed(void 0).chain(function() {
                return c.init()
            }).chain(function() {
                return c.getCell(b.mechanism(), b.cell())
            }).chain(function(a) {
                return a.getSegments([b.key()])
            }).chain(function(a) {
                return {
                    uri: b,
                    originalUri: b,
                    data: a[0].data,
                    headers: {}
                }
            })["finally"](function() {
                return c.destroy()
            })
        };
        shaka.net.NetworkingEngine.registerScheme("offline", shaka.offline.OfflineScheme);
        shaka.offline.SessionDeleter = function() {};
        shaka.offline.SessionDeleter.prototype["delete"] = function(a, b, c) {
            var d = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                var g, h, k, l, m, n, q;
                return $jscomp.generator.createGenerator(f, function(f) {
                    switch (f.nextAddress) {
                        case 1:
                            g = shaka.offline.SessionDeleter, h = [], k = $jscomp.makeIterator(g.createBuckets_(c)), l = k.next();
                        case 2:
                            if (l.done) {
                                f.jumpTo(4);
                                break
                            }
                            m = l.value;
                            n = d.doDelete_(a, b, m);
                            return f.yield(n, 5);
                        case 5:
                            q = f.yieldResult;
                            h = h.concat(q);
                            l = k.next();
                            f.jumpTo(2);
                            break;
                        case 4:
                            return f["return"](h)
                    }
                })
            })
        };
        shaka.offline.SessionDeleter.prototype.doDelete_ = function(a, b, c) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return f = new shaka.media.DrmEngine({
                                netEngine: b,
                                onError: function() {},
                                onKeyStatus: function() {},
                                onExpirationUpdated: function() {},
                                onEvent: function() {}
                            }), e.setCatchFinallyBlocks(2), f.configure(a), e.yield(f.initForRemoval(c.info.keySystem, c.info.licenseUri, c.info.serverCertificate,
                                c.info.audioCapabilities, c.info.videoCapabilities), 4);
                        case 4:
                            e.leaveTryBlock(3);
                            break;
                        case 2:
                            return g = e.enterCatchBlock(), shaka.log.warning("Error initializing EME", g), e.yield(f.destroy(), 5);
                        case 5:
                            return e["return"]([]);
                        case 3:
                            return e.setCatchFinallyBlocks(6), e.yield(f.setServerCertificate(), 8);
                        case 8:
                            e.leaveTryBlock(7);
                            break;
                        case 6:
                            return h = e.enterCatchBlock(), shaka.log.warning("Error setting server certificate", h), e.yield(f.destroy(), 9);
                        case 9:
                            return e["return"]([]);
                        case 7:
                            return k = [], e.yield(Promise.all(c.sessionIds.map(function(a) {
                                return $jscomp.asyncExecutePromiseGeneratorFunction(function q() {
                                    var b;
                                    return $jscomp.generator.createGenerator(q, function(c) {
                                        switch (c.nextAddress) {
                                            case 1:
                                                return c.setCatchFinallyBlocks(2), c.yield(f.removeSession(a), 4);
                                            case 4:
                                                k.push(a);
                                                c.leaveTryBlock(0);
                                                break;
                                            case 2:
                                                b = c.enterCatchBlock(), shaka.log.warning("Error deleting offline session", b), c.jumpToEnd()
                                        }
                                    })
                                })
                            })), 10);
                        case 10:
                            return e.yield(f.destroy(), 11);
                        case 11:
                            return e["return"](k)
                    }
                })
            })
        };
        shaka.offline.SessionDeleter.createBuckets_ = function(a) {
            var b = shaka.offline.SessionDeleter,
                c = [];
            a = $jscomp.makeIterator(a);
            for (var d = a.next(); !d.done; d = a.next()) {
                d = d.value;
                for (var e = !1, f = $jscomp.makeIterator(c), g = f.next(); !g.done; g = f.next())
                    if (g = g.value, b.isCompatible_(g.info, d)) {
                        g.sessionIds.push(d.sessionId);
                        e = !0;
                        break
                    } e || c.push({
                    info: d,
                    sessionIds: [d.sessionId]
                })
            }
            return c
        };
        shaka.offline.SessionDeleter.isCompatible_ = function(a, b) {
            var c = shaka.util.ArrayUtils,
                d = function(a, b) {
                    return a.robustness == b.robustness && a.contentType == b.contentType
                };
            return a.keySystem == b.keySystem && a.licenseUri == b.licenseUri && c.hasSameElements(a.audioCapabilities, b.audioCapabilities, d) && c.hasSameElements(a.videoCapabilities, b.videoCapabilities, d)
        };
        shaka.routing = {};
        shaka.routing.Walker = function(a, b, c) {
            var d = this;
            this.implementation_ = c;
            this.currentlyAt_ = a;
            this.currentlyWith_ = b;
            this.waitForWork_ = null;
            this.requests_ = [];
            this.currentStep_ = this.currentRoute_ = null;
            this.isAlive_ = !0;
            this.mainLoopPromise_ = Promise.resolve().then(function() {
                return d.mainLoop_()
            })
        };
        shaka.routing.Walker.prototype.getCurrentPayload = function() {
            return this.currentlyWith_
        };
        shaka.routing.Walker.prototype.destroy = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return a.isAlive_ = !1, a.currentStep_ && a.currentStep_.abort(), a.unblockMainLoop_(), c.yield(a.mainLoopPromise_, 2);
                        case 2:
                            if (a.currentRoute_) a.currentRoute_.listeners.onCancel();
                            for (var e = $jscomp.makeIterator(a.requests_), g = e.next(); !g.done; g = e.next()) d = g.value, d.listeners.onCancel();
                            a.currentRoute_ =
                                null;
                            a.requests_ = [];
                            a.implementation_ = null;
                            c.jumpToEnd()
                    }
                })
            })
        };
        shaka.routing.Walker.prototype.startNewRoute = function(a) {
            var b = {
                onStart: function() {},
                onEnd: function() {},
                onCancel: function() {},
                onError: function(a) {},
                onSkip: function() {},
                onEnter: function() {}
            };
            this.requests_.push({
                create: a,
                listeners: b
            });
            this.currentStep_ && this.currentStep_.abort();
            this.unblockMainLoop_();
            return b
        };
        shaka.routing.Walker.prototype.mainLoop_ = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            if (a.isAlive_) return c.yield(a.doOneThing_(), 1);
                            c.jumpTo(0)
                    }
                })
            })
        };
        shaka.routing.Walker.prototype.doOneThing_ = function() {
            if (this.tryNewRoute_()) return Promise.resolve();
            if (this.currentRoute_) return this.takeNextStep_();
            goog.asserts.assert(null == this.waitForWork_, "We should not have a promise yet.");
            this.implementation_.onIdle(this.currentlyAt_);
            return this.waitForWork_ = new shaka.util.PublicPromise
        };
        shaka.routing.Walker.prototype.tryNewRoute_ = function() {
            goog.asserts.assert(null == this.currentStep_, "We should never have a current step between taking steps.");
            if (0 == this.requests_.length || this.currentRoute_ && !this.currentRoute_.interruptible) return !1;
            this.currentRoute_ && (this.currentRoute_.listeners.onCancel(), this.currentRoute_ = null);
            var a = this.requests_.shift(),
                b = a.create(this.currentlyWith_);
            if (b) a.listeners.onStart(), this.currentRoute_ = {
                node: b.node,
                payload: b.payload,
                interruptible: b.interruptible,
                listeners: a.listeners
            };
            else a.listeners.onSkip();
            return !0
        };
        shaka.routing.Walker.prototype.takeNextStep_ = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return goog.asserts.assert(a.currentRoute_, "We need a current route to take the next step."), a.currentlyAt_ = a.implementation_.getNext(a.currentlyAt_, a.currentlyWith_, a.currentRoute_.node, a.currentRoute_.payload), a.currentRoute_.listeners.onEnter(a.currentlyAt_), c.setCatchFinallyBlocks(2),
                                a.currentStep_ = a.implementation_.enterNode(a.currentlyAt_, a.currentlyWith_, a.currentRoute_.payload), c.yield(a.currentStep_.promise, 4);
                        case 4:
                            a.currentStep_ = null;
                            a.currentlyAt_ == a.currentRoute_.node && (a.currentRoute_.listeners.onEnd(), a.currentRoute_ = null);
                            c.leaveTryBlock(0);
                            break;
                        case 2:
                            d = c.enterCatchBlock();
                            if (d.code == shaka.util.Error.Code.OPERATION_ABORTED) goog.asserts.assert(a.currentRoute_.interruptible, "Do not put abortable steps in non-interruptible routes!"), a.currentRoute_.listeners.onCancel();
                            else a.currentRoute_.listeners.onError(d);
                            a.currentRoute_ = null;
                            a.currentStep_ = null;
                            e = a;
                            return c.yield(a.implementation_.handleError(a.currentlyWith_, d), 5);
                        case 5:
                            e.currentlyAt_ = c.yieldResult, c.jumpToEnd()
                    }
                })
            })
        };
        shaka.routing.Walker.prototype.unblockMainLoop_ = function() {
            this.waitForWork_ && (this.waitForWork_.resolve(), this.waitForWork_ = null)
        };
        shaka.text.SimpleTextDisplayer = function(a) {
            this.textTrack_ = null;
            for (var b = 0; b < a.textTracks.length; ++b) {
                var c = a.textTracks[b];
                c.mode = "disabled";
                c.label == shaka.Player.TextTrackLabel && (this.textTrack_ = c)
            }
            this.textTrack_ || (this.textTrack_ = a.addTextTrack("subtitles", shaka.Player.TextTrackLabel));
            this.textTrack_.mode = "hidden"
        };
        goog.exportSymbol("shaka.text.SimpleTextDisplayer", shaka.text.SimpleTextDisplayer);
        shaka.text.SimpleTextDisplayer.prototype.remove = function(a, b) {
            if (!this.textTrack_) return !1;
            shaka.text.SimpleTextDisplayer.removeWhere_(this.textTrack_, function(c) {
                return c.startTime < b && c.endTime > a
            });
            return !0
        };
        goog.exportProperty(shaka.text.SimpleTextDisplayer.prototype, "remove", shaka.text.SimpleTextDisplayer.prototype.remove);
        shaka.text.SimpleTextDisplayer.prototype.append = function(a) {
            var b = shaka.text.SimpleTextDisplayer.convertToTextTrackCue_,
                c = a.map(function(a) {
                    if (a.nestedCues.length) {
                        var b = a.nestedCues.map(function(a) {
                            return a.spacer ? "\n" : a.payload + " "
                        }).join("").replace(/ $/m, "");
                        a = a.clone();
                        a.nestedCues = [];
                        a.payload = b
                    }
                    return a
                }),
                d = [];
            a = this.textTrack_.cues ? Array.from(this.textTrack_.cues) : [];
            var e = {};
            c = $jscomp.makeIterator(c);
            for (var f = c.next(); !f.done; e = {
                    inCue: e.inCue
                }, f = c.next()) e.inCue = f.value, a.some(function(a) {
                return function(b) {
                    return b.startTime ==
                        a.inCue.startTime && b.endTime == a.inCue.endTime && b.text == a.inCue.payload ? !0 : !1
                }
            }(e)) || (f = b(e.inCue)) && d.push(f);
            d.slice().sort(function(a, b) {
                return a.startTime != b.startTime ? a.startTime - b.startTime : a.endTime != b.endTime ? a.endTime - b.startTime : "line" in VTTCue.prototype ? d.indexOf(b) - d.indexOf(a) : d.indexOf(a) - d.indexOf(b)
            }).forEach(function(a) {
                this.textTrack_.addCue(a)
            }.bind(this))
        };
        goog.exportProperty(shaka.text.SimpleTextDisplayer.prototype, "append", shaka.text.SimpleTextDisplayer.prototype.append);
        shaka.text.SimpleTextDisplayer.prototype.destroy = function() {
            this.textTrack_ && shaka.text.SimpleTextDisplayer.removeWhere_(this.textTrack_, function(a) {
                return !0
            });
            this.textTrack_ = null;
            return Promise.resolve()
        };
        goog.exportProperty(shaka.text.SimpleTextDisplayer.prototype, "destroy", shaka.text.SimpleTextDisplayer.prototype.destroy);
        shaka.text.SimpleTextDisplayer.prototype.isTextVisible = function() {
            return "showing" == this.textTrack_.mode
        };
        goog.exportProperty(shaka.text.SimpleTextDisplayer.prototype, "isTextVisible", shaka.text.SimpleTextDisplayer.prototype.isTextVisible);
        shaka.text.SimpleTextDisplayer.prototype.setTextVisibility = function(a) {
            this.textTrack_.mode = a ? "showing" : "hidden"
        };
        goog.exportProperty(shaka.text.SimpleTextDisplayer.prototype, "setTextVisibility", shaka.text.SimpleTextDisplayer.prototype.setTextVisibility);
        shaka.text.SimpleTextDisplayer.convertToTextTrackCue_ = function(a) {
            if (a.startTime >= a.endTime) return shaka.log.warning("Invalid cue times: " + a.startTime + " - " + a.endTime), null;
            var b = shaka.text.Cue,
                c = new VTTCue(a.startTime, a.endTime, a.payload);
            c.lineAlign = a.lineAlign;
            c.positionAlign = a.positionAlign;
            a.size && (c.size = a.size);
            try {
                c.align = a.textAlign
            } catch (d) {}
            "center" == a.textAlign && "center" != c.align && (c.align = "middle");
            a.writingMode == b.writingMode.VERTICAL_LEFT_TO_RIGHT ? c.vertical = "lr" : a.writingMode == b.writingMode.VERTICAL_RIGHT_TO_LEFT &&
                (c.vertical = "rl");
            a.lineInterpretation == b.lineInterpretation.PERCENTAGE && (c.snapToLines = !1);
            null != a.line && (c.line = a.line);
            null != a.position && (c.position = a.position);
            return c
        };
        shaka.text.SimpleTextDisplayer.removeWhere_ = function(a, b) {
            var c = a.mode,
                d = "showing" == c ? "showing" : "hidden";
            a.mode = d;
            goog.asserts.assert(a.cues, 'Cues should be accessible when mode is set to "' + d + '".');
            d = a.cues;
            for (var e = d.length - 1; 0 <= e; e--) {
                var f = d[e];
                f && b(f) && a.removeCue(f)
            }
            a.mode = c
        };
        shaka.util.ConfigUtils = {};
        shaka.util.ConfigUtils.mergeConfigObjects = function(a, b, c, d, e) {
            goog.asserts.assert(a, "Destination config must not be null!");
            var f = e in d,
                g = !0,
                h;
            for (h in b) {
                var k = e + "." + h,
                    l = f ? d[e] : c[h];
                f || h in c ? void 0 === b[h] ? void 0 === l || f ? delete a[h] : a[h] = shaka.util.ObjectUtils.cloneObject(l) : l.constructor == Object && b[h] && b[h].constructor == Object ? (a[h] || (a[h] = shaka.util.ObjectUtils.cloneObject(l)), k = shaka.util.ConfigUtils.mergeConfigObjects(a[h], b[h], l, d, k), g = g && k) : typeof b[h] != typeof l || null == b[h] || "function" != typeof b[h] &&
                    b[h].constructor != l.constructor ? (shaka.log.alwaysError("Invalid config, wrong type for " + k), g = !1) : ("function" == typeof c[h] && c[h].length != b[h].length && shaka.log.alwaysWarn("Unexpected number of arguments for " + k), a[h] = b[h]) : (shaka.log.alwaysError("Invalid config, unrecognized key " + k), g = !1)
            }
            return g
        };
        goog.exportSymbol("shaka.util.ConfigUtils.mergeConfigObjects", shaka.util.ConfigUtils.mergeConfigObjects);
        shaka.util.ConfigUtils.convertToConfigObject = function(a, b) {
            for (var c = {}, d = c, e = 0, f = 0;;) {
                e = a.indexOf(".", e);
                if (0 > e) break;
                if (0 == e || "\\" != a[e - 1]) f = a.substring(f, e).replace(/\\\./g, "."), d[f] = {}, d = d[f], f = e + 1;
                e += 1
            }
            d[a.substring(f).replace(/\\\./g, ".")] = b;
            return c
        };
        goog.exportSymbol("shaka.util.ConfigUtils.convertToConfigObject", shaka.util.ConfigUtils.convertToConfigObject);
        shaka.util.PlayerConfiguration = function() {};
        goog.exportSymbol("shaka.util.PlayerConfiguration", shaka.util.PlayerConfiguration);
        shaka.util.PlayerConfiguration.createDefault = function() {
            var a = 5E5,
                b = Infinity;
            navigator.connection && (navigator.connection.downlink && (a = 1E6 * navigator.connection.downlink), navigator.connection.saveData && (b = 360));
            var c = {
                    retryParameters: shaka.net.NetworkingEngine.defaultRetryParameters(),
                    servers: {},
                    clearKeys: {},
                    advanced: {},
                    delayLicenseRequestUntilPlayed: !1,
                    initDataTransform: shaka.media.DrmEngine.defaultInitDataTransform,
                    fairPlayTransform: !0,
                    updateExpirationTime: 1
                },
                d = {
                    retryParameters: shaka.net.NetworkingEngine.defaultRetryParameters(),
                    availabilityWindowOverride: NaN,
                    disableAudio: !1,
                    disableVideo: !1,
                    disableText: !1,
                    dash: {
                        customScheme: function(a) {
                            if (a) return null
                        },
                        clockSyncUri: "",
                        ignoreDrmInfo: !1,
                        xlinkFailGracefully: !1,
                        defaultPresentationDelay: 10,
                        ignoreMinBufferTime: !1,
                        autoCorrectDrift: !0,
                        ignoreSuggestedPresentationDelay: !1,
                        ignoreEmptyAdaptationSet: !1
                    },
                    hls: {
                        ignoreTextStreamFailures: !1,
                        useFullSegmentsForStartTime: !1
                    }
                },
                e = {
                    retryParameters: shaka.net.NetworkingEngine.defaultRetryParameters(),
                    failureCallback: function(a) {
                        shaka.log.error("Unhandled streaming error",
                            a);
                        return [a]
                    },
                    rebufferingGoal: 2,
                    bufferingGoal: 10,
                    bufferBehind: 30,
                    ignoreTextStreamFailures: !1,
                    alwaysStreamText: !1,
                    startAtSegmentBoundary: !1,
                    smallGapLimit: .5,
                    jumpLargeGaps: !1,
                    durationBackoff: 1,
                    forceTransmuxTS: !1,
                    safeSeekOffset: 5,
                    stallEnabled: !0,
                    stallThreshold: 1,
                    stallSkip: .1,
                    useNativeHlsOnSafari: !0
                };
            if (shaka.util.Platform.isWebOS() || shaka.util.Platform.isTizen() || shaka.util.Platform.isChromecast()) e.stallSkip = 0;
            var f = {
                    trackSelectionCallback: function(a) {
                        return $jscomp.asyncExecutePromiseGeneratorFunction(function l() {
                            return $jscomp.generator.createGenerator(l,
                                function(b) {
                                    switch (b.nextAddress) {
                                        case 1:
                                            return b["return"](a)
                                    }
                                })
                        })
                    },
                    progressCallback: function(a, b) {
                        return [a, b]
                    },
                    usePersistentLicense: !0
                },
                g = {
                    drm: c,
                    manifest: d,
                    streaming: e,
                    offline: f,
                    abrFactory: shaka.abr.SimpleAbrManager,
                    abr: {
                        enabled: !0,
                        defaultBandwidthEstimate: a,
                        switchInterval: 8,
                        bandwidthUpgradeTarget: .85,
                        bandwidthDowngradeTarget: .95,
                        restrictions: {
                            minWidth: 0,
                            maxWidth: Infinity,
                            minHeight: 0,
                            maxHeight: b,
                            minPixels: 0,
                            maxPixels: Infinity,
                            minFrameRate: 0,
                            maxFrameRate: Infinity,
                            minBandwidth: 0,
                            maxBandwidth: Infinity
                        }
                    },
                    preferredAudioLanguage: "",
                    preferredTextLanguage: "",
                    preferredVariantRole: "",
                    preferredTextRole: "",
                    preferredAudioChannelCount: 2,
                    restrictions: {
                        minWidth: 0,
                        maxWidth: Infinity,
                        minHeight: 0,
                        maxHeight: Infinity,
                        minPixels: 0,
                        maxPixels: Infinity,
                        minFrameRate: 0,
                        maxFrameRate: Infinity,
                        minBandwidth: 0,
                        maxBandwidth: Infinity
                    },
                    playRangeStart: 0,
                    playRangeEnd: Infinity,
                    textDisplayFactory: function() {
                        return null
                    }
                };
            f.trackSelectionCallback = function(a) {
                return $jscomp.asyncExecutePromiseGeneratorFunction(function l() {
                    return $jscomp.generator.createGenerator(l,
                        function(b) {
                            switch (b.nextAddress) {
                                case 1:
                                    return b["return"](shaka.util.PlayerConfiguration.defaultTrackSelect(a, g.preferredAudioLanguage))
                            }
                        })
                })
            };
            return g
        };
        shaka.util.PlayerConfiguration.mergeConfigObjects = function(a, b, c) {
            var d = {
                ".drm.servers": "",
                ".drm.clearKeys": "",
                ".drm.advanced": {
                    distinctiveIdentifierRequired: !1,
                    persistentStateRequired: !1,
                    videoRobustness: "",
                    audioRobustness: "",
                    serverCertificate: new Uint8Array(0),
                    individualizationServer: ""
                }
            };
            return shaka.util.ConfigUtils.mergeConfigObjects(a, b, c || shaka.util.PlayerConfiguration.createDefault(), d, "")
        };
        goog.exportProperty(shaka.util.PlayerConfiguration, "mergeConfigObjects", shaka.util.PlayerConfiguration.mergeConfigObjects);
        shaka.util.PlayerConfiguration.defaultTrackSelect = function(a, b) {
            var c = shaka.util.ManifestParserUtils.ContentType,
                d = shaka.util.LanguageUtils,
                e = a.filter(function(a) {
                    return "variant" == a.type
                }),
                f = [],
                g = d.findClosestLocale(b, e.map(function(a) {
                    return a.language
                }));
            g && (f = e.filter(function(a) {
                return d.normalize(a.language) == g
            }));
            0 == f.length && (f = e.filter(function(a) {
                return a.primary
            }));
            0 == f.length && (1 < (new Set(e.map(function(a) {
                    return a.language
                }))).size && shaka.log.warning("Could not choose a good audio track based on language preferences or primary tracks.  An arbitrary language will be stored!"),
                f = e);
            var h = f.filter(function(a) {
                return a.height && 480 >= a.height
            });
            h.length && (h.sort(function(a, b) {
                return b.height - a.height
            }), f = h.filter(function(a) {
                return a.height == h[0].height
            }));
            e = [];
            if (f.length) {
                var k = Math.floor(f.length / 2);
                f.sort(function(a, b) {
                    return a.bandwidth - b.bandwidth
                });
                e.push(f[k])
            }
            f = $jscomp.makeIterator(a);
            for (k = f.next(); !k.done; k = f.next()) k = k.value, k.type == c.TEXT && e.push(k);
            return e
        };
        shaka.util.StateHistory = function() {
            this.open_ = null;
            this.closed_ = []
        };
        shaka.util.StateHistory.prototype.update = function(a) {
            null == this.open_ ? this.start_(a) : this.update_(a)
        };
        shaka.util.StateHistory.prototype.getTimeSpentIn = function(a) {
            var b = 0;
            this.open_ && this.open_.state == a && (b += this.open_.duration);
            for (var c = $jscomp.makeIterator(this.closed_), d = c.next(); !d.done; d = c.next()) d = d.value, b += d.state == a ? d.duration : 0;
            return b
        };
        shaka.util.StateHistory.prototype.getCopy = function() {
            for (var a = function(a) {
                    return {
                        timestamp: a.timestamp,
                        state: a.state,
                        duration: a.duration
                    }
                }, b = [], c = $jscomp.makeIterator(this.closed_), d = c.next(); !d.done; d = c.next()) b.push(a(d.value));
            this.open_ && b.push(a(this.open_));
            return b
        };
        shaka.util.StateHistory.prototype.start_ = function(a) {
            goog.asserts.assert(null == this.open_, "There must be no open entry in order when we start");
            this.open_ = {
                timestamp: this.getNowInSeconds_(),
                state: a,
                duration: 0
            }
        };
        shaka.util.StateHistory.prototype.update_ = function(a) {
            goog.asserts.assert(this.open_, "There must be an open entry in order to update it");
            var b = this.getNowInSeconds_();
            this.open_.duration = b - this.open_.timestamp;
            this.open_.state != a && (this.closed_.push(this.open_), this.open_ = {
                timestamp: b,
                state: a,
                duration: 0
            })
        };
        shaka.util.StateHistory.prototype.getNowInSeconds_ = function() {
            return Date.now() / 1E3
        };
        shaka.util.SwitchHistory = function() {
            this.currentText_ = this.currentVariant_ = null;
            this.history_ = []
        };
        shaka.util.SwitchHistory.prototype.updateCurrentVariant = function(a, b) {
            this.currentVariant_ != a && (this.currentVariant_ = a, this.history_.push({
                timestamp: this.getNowInSeconds_(),
                id: a.id,
                type: "variant",
                fromAdaptation: b,
                bandwidth: a.bandwidth
            }))
        };
        shaka.util.SwitchHistory.prototype.updateCurrentText = function(a, b) {
            this.currentText_ != a && (this.currentText_ = a, this.history_.push({
                timestamp: this.getNowInSeconds_(),
                id: a.id,
                type: "text",
                fromAdaptation: b,
                bandwidth: null
            }))
        };
        shaka.util.SwitchHistory.prototype.getCopy = function() {
            for (var a = [], b = $jscomp.makeIterator(this.history_), c = b.next(); !c.done; c = b.next()) a.push(this.clone_(c.value));
            return a
        };
        shaka.util.SwitchHistory.prototype.getNowInSeconds_ = function() {
            return Date.now() / 1E3
        };
        shaka.util.SwitchHistory.prototype.clone_ = function(a) {
            return {
                timestamp: a.timestamp,
                id: a.id,
                type: a.type,
                fromAdaptation: a.fromAdaptation,
                bandwidth: a.bandwidth
            }
        };
        shaka.util.Stats = function() {
            this.bandwidthEstimate_ = this.variantBandwidth_ = this.licenseTimeSeconds_ = this.loadLatencySeconds_ = this.totalCorruptedFrames_ = this.totalDecodedFrames_ = this.totalDroppedFrames_ = this.height_ = this.width_ = NaN;
            this.stateHistory_ = new shaka.util.StateHistory;
            this.switchHistory_ = new shaka.util.SwitchHistory
        };
        shaka.util.Stats.prototype.setDroppedFrames = function(a, b) {
            this.totalDroppedFrames_ = a;
            this.totalDecodedFrames_ = b
        };
        shaka.util.Stats.prototype.setCorruptedFrames = function(a) {
            this.totalCorruptedFrames_ = a
        };
        shaka.util.Stats.prototype.setResolution = function(a, b) {
            this.width_ = a;
            this.height_ = b
        };
        shaka.util.Stats.prototype.setLoadLatency = function(a) {
            this.loadLatencySeconds_ = a
        };
        shaka.util.Stats.prototype.setLicenseTime = function(a) {
            this.licenseTimeSeconds_ = a
        };
        shaka.util.Stats.prototype.setVariantBandwidth = function(a) {
            this.variantBandwidth_ = a
        };
        shaka.util.Stats.prototype.setBandwidthEstimate = function(a) {
            this.bandwidthEstimate_ = a
        };
        shaka.util.Stats.prototype.getStateHistory = function() {
            return this.stateHistory_
        };
        shaka.util.Stats.prototype.getSwitchHistory = function() {
            return this.switchHistory_
        };
        shaka.util.Stats.prototype.getBlob = function() {
            return {
                width: this.width_,
                height: this.height_,
                streamBandwidth: this.variantBandwidth_,
                decodedFrames: this.totalDecodedFrames_,
                droppedFrames: this.totalDroppedFrames_,
                corruptedFrames: this.totalCorruptedFrames_,
                estimatedBandwidth: this.bandwidthEstimate_,
                loadLatency: this.loadLatencySeconds_,
                playTime: this.stateHistory_.getTimeSpentIn("playing"),
                pauseTime: this.stateHistory_.getTimeSpentIn("paused"),
                bufferingTime: this.stateHistory_.getTimeSpentIn("buffering"),
                licenseTime: this.licenseTimeSeconds_,
                stateHistory: this.stateHistory_.getCopy(),
                switchHistory: this.switchHistory_.getCopy()
            }
        };
        shaka.util.Stats.getEmptyBlob = function() {
            return {
                width: NaN,
                height: NaN,
                streamBandwidth: NaN,
                decodedFrames: NaN,
                droppedFrames: NaN,
                corruptedFrames: NaN,
                estimatedBandwidth: NaN,
                loadLatency: NaN,
                playTime: NaN,
                pauseTime: NaN,
                bufferingTime: NaN,
                licenseTime: NaN,
                switchHistory: [],
                stateHistory: []
            }
        };
        shaka.Player = function(a, b) {
            var c = this;
            shaka.util.FakeEventTarget.call(this);
            this.loadMode_ = shaka.Player.LoadMode.NOT_LOADED;
            this.video_ = null;
            this.isTextVisible_ = !1;
            this.eventManager_ = new shaka.util.EventManager;
            this.abrManagerFactory_ = this.abrManager_ = this.assetUri_ = this.manifest_ = this.parser_ = this.streamingEngine_ = this.regionTimeline_ = this.bufferObserver_ = this.bufferPoller_ = this.playRateController_ = this.playheadObservers_ = this.playhead_ = this.mediaSourceEngine_ = this.drmEngine_ = this.networkingEngine_ =
                null;
            this.nextExternalStreamId_ = 1E9;
            this.loadingTextStreams_ = new Set;
            this.switchingPeriods_ = !0;
            this.deferredVariant_ = null;
            this.deferredVariantClearBuffer_ = !1;
            this.deferredVariantClearBufferSafeMargin_ = 0;
            this.deferredTextStream_ = null;
            this.activeStreams_ = new shaka.media.ActiveStreamMap;
            this.config_ = this.defaultConfig_();
            this.maxHwRes_ = {
                width: Infinity,
                height: Infinity
            };
            this.stats_ = null;
            this.currentAdaptationSetCriteria_ = new shaka.media.PreferenceBasedCriteria(this.config_.preferredAudioLanguage, this.config_.preferredVariantRole,
                this.config_.preferredAudioChannelCount);
            this.currentTextLanguage_ = this.config_.preferredTextLanguage;
            this.currentTextRole_ = this.config_.preferredTextRole;
            this.cleanupOnUnload_ = [];
            b && b(this);
            this.networkingEngine_ = this.createNetworkingEngine();
            this.eventManager_.listen(window, "online", function() {
                c.retryStreaming()
            });
            this.detachNode_ = {
                name: "detach"
            };
            this.attachNode_ = {
                name: "attach"
            };
            this.unloadNode_ = {
                name: "unload"
            };
            this.parserNode_ = {
                name: "manifest-parser"
            };
            this.manifestNode_ = {
                name: "manifest"
            };
            this.mediaSourceNode_ = {
                name: "media-source"
            };
            this.drmNode_ = {
                name: "drm-engine"
            };
            this.loadNode_ = {
                name: "load"
            };
            this.srcEqualsDrmNode_ = {
                name: "src-equals-drm-engine"
            };
            this.srcEqualsNode_ = {
                name: "src-equals"
            };
            var d = shaka.util.AbortableOperation,
                e = new Map;
            e.set(this.attachNode_, function(a, b) {
                return d.notAbortable(c.onAttach_(a, b))
            });
            e.set(this.detachNode_, function(a, b) {
                return d.notAbortable(c.onDetach_(a, b))
            });
            e.set(this.unloadNode_, function(a, b) {
                return d.notAbortable(c.onUnload_(a, b))
            });
            e.set(this.mediaSourceNode_, function(a,
                b) {
                var e = c.onInitializeMediaSourceEngine_(a, b);
                return d.notAbortable(e)
            });
            e.set(this.parserNode_, function(a, b) {
                var e = c.onInitializeParser_(a, b);
                return d.notAbortable(e)
            });
            e.set(this.manifestNode_, function(a, b) {
                return c.onParseManifest_(a, b)
            });
            e.set(this.drmNode_, function(a, b) {
                var e = c.onInitializeDrm_(a, b);
                return d.notAbortable(e)
            });
            e.set(this.loadNode_, function(a, b) {
                return d.notAbortable(c.onLoad_(a, b))
            });
            e.set(this.srcEqualsDrmNode_, function(a, b) {
                var e = c.onInitializeSrcEqualsDrm_(a, b);
                return d.notAbortable(e)
            });
            e.set(this.srcEqualsNode_, function(a, b) {
                return c.onSrcEquals_(a, b)
            });
            this.walker_ = new shaka.routing.Walker(this.detachNode_, this.createEmptyPayload_(), {
                getNext: function(a, b, d, e) {
                    return c.getNextStep_(a, b, d, e)
                },
                enterNode: function(a, b, d) {
                    c.dispatchEvent(new shaka.util.FakeEvent("onstatechange", {
                        state: a.name
                    }));
                    return e.get(a)(b, d)
                },
                handleError: function(a, b) {
                    return $jscomp.asyncExecutePromiseGeneratorFunction(function k() {
                        return $jscomp.generator.createGenerator(k, function(d) {
                            switch (d.nextAddress) {
                                case 1:
                                    return shaka.log.warning("The walker saw an error:"),
                                        b instanceof shaka.util.Error ? shaka.log.warning("Error Code:", b.code) : (shaka.log.warning("Error Message:", b.message), shaka.log.warning("Error Stack:", b.stack)), d.yield(c.onUnload_(a, c.createEmptyPayload_()), 2);
                                case 2:
                                    return d["return"](a.mediaElement ? c.attachNode_ : c.detachNode_)
                            }
                        })
                    })
                },
                onIdle: function(a) {
                    c.dispatchEvent(new shaka.util.FakeEvent("onstateidle", {
                        state: a.name
                    }))
                }
            });
            a && this.attach(a, !0)
        };
        goog.inherits(shaka.Player, shaka.util.FakeEventTarget);
        goog.exportSymbol("shaka.Player", shaka.Player);
        shaka.Player.prototype.destroy = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            if (a.loadMode_ == shaka.Player.LoadMode.DESTROYED) return c["return"]();
                            a.loadMode_ = shaka.Player.LoadMode.DESTROYED;
                            d = a.walker_.startNewRoute(function(c) {
                                return {
                                    node: a.detachNode_,
                                    payload: a.createEmptyPayload_(),
                                    interruptible: !1
                                }
                            });
                            return c.yield(new Promise(function(c) {
                                d.onStart = function() {
                                    shaka.log.info("Preparing to destroy walker...")
                                };
                                d.onEnd = function() {
                                    c();
                                    a.dispatchEvent(new shaka.util.FakeEvent("loaded"))
                                };
                                d.onCancel = function() {
                                    goog.asserts.assert(!1, "Our final detach call should never be cancelled.");
                                    c()
                                };
                                d.onError = function() {
                                    goog.asserts.assert(!1, "Our final detach call should never see an error");
                                    c()
                                };
                                d.onSkip = function() {
                                    goog.asserts.assert(!1, "Our final detach call should never be skipped");
                                    c()
                                }
                            }), 2);
                        case 2:
                            return c.yield(a.walker_.destroy(), 3);
                        case 3:
                            a.eventManager_ && (a.eventManager_.release(), a.eventManager_ = null);
                            a.abrManagerFactory_ =
                                null;
                            a.abrManager_ = null;
                            a.config_ = null;
                            if (!a.networkingEngine_) {
                                c.jumpTo(0);
                                break
                            }
                            return c.yield(a.networkingEngine_.destroy(), 5);
                        case 5:
                            a.networkingEngine_ = null, c.jumpToEnd()
                    }
                })
            })
        };
        goog.exportProperty(shaka.Player.prototype, "destroy", shaka.Player.prototype.destroy);
        shaka.Player.version = "v2.5.19-debug";
        goog.exportProperty(shaka.Player, "version", shaka.Player.version);
        shaka.Deprecate.init(shaka.Player.version);
        shaka.Player.restrictedStatuses_ = ["output-restricted", "internal-error"];
        shaka.Player.supportPlugins_ = {};
        shaka.Player.registerSupportPlugin = function(a, b) {
            shaka.Player.supportPlugins_[a] = b
        };
        goog.exportProperty(shaka.Player, "registerSupportPlugin", shaka.Player.registerSupportPlugin);
        shaka.Player.isBrowserSupported = function() {
            if (!(window.Promise && window.Uint8Array && Array.prototype.forEach)) return !1;
            var a = shaka.util.Platform.safariVersion();
            return a && 12 > a || !shaka.media.DrmEngine.isBrowserSupported() ? !1 : shaka.util.Platform.supportsMediaSource() ? !0 : shaka.util.Platform.supportsMediaType("application/x-mpegurl")
        };
        goog.exportProperty(shaka.Player, "isBrowserSupported", shaka.Player.isBrowserSupported);
        shaka.Player.probeSupport = function() {
            goog.asserts.assert(shaka.Player.isBrowserSupported(), "Must have basic support");
            return shaka.media.DrmEngine.probeSupport().then(function(a) {
                var b = shaka.media.ManifestParser.probeSupport(),
                    c = shaka.media.MediaSourceEngine.probeSupport();
                a = {
                    manifest: b,
                    media: c,
                    drm: a
                };
                b = shaka.Player.supportPlugins_;
                for (var d in b) a[d] = b[d]();
                return a
            })
        };
        goog.exportProperty(shaka.Player, "probeSupport", shaka.Player.probeSupport);
        shaka.Player.prototype.attach = function(a, b) {
            b = void 0 === b ? !0 : b;
            if (this.loadMode_ == shaka.Player.LoadMode.DESTROYED) return Promise.reject(this.createAbortLoadError_());
            var c = this.createEmptyPayload_();
            c.mediaElement = a;
            shaka.util.Platform.supportsMediaSource() || (b = !1);
            var d = b ? this.mediaSourceNode_ : this.attachNode_,
                e = this.walker_.startNewRoute(function(a) {
                    return {
                        node: d,
                        payload: c,
                        interruptible: !1
                    }
                });
            e.onStart = function() {
                return shaka.log.info("Starting attach...")
            };
            return this.wrapWalkerListenersWithPromise_(e)
        };
        goog.exportProperty(shaka.Player.prototype, "attach", shaka.Player.prototype.attach);
        shaka.Player.prototype.detach = function() {
            var a = this;
            if (this.loadMode_ == shaka.Player.LoadMode.DESTROYED) return Promise.reject(this.createAbortLoadError_());
            var b = this.walker_.startNewRoute(function(b) {
                return {
                    node: a.detachNode_,
                    payload: a.createEmptyPayload_(),
                    interruptible: !1
                }
            });
            b.onStart = function() {
                return shaka.log.info("Starting detach...")
            };
            return this.wrapWalkerListenersWithPromise_(b)
        };
        goog.exportProperty(shaka.Player.prototype, "detach", shaka.Player.prototype.detach);
        shaka.Player.prototype.unload = function(a) {
            var b = this;
            a = void 0 === a ? !0 : a;
            if (this.loadMode_ == shaka.Player.LoadMode.DESTROYED) return Promise.reject(this.createAbortLoadError_());
            shaka.util.Platform.supportsMediaSource() || (a = !1);
            var c = this.createEmptyPayload_(),
                d = this.walker_.startNewRoute(function(d) {
                    var e = d.mediaElement && a ? b.mediaSourceNode_ : d.mediaElement ? b.attachNode_ : b.detachNode_;
                    goog.asserts.assert(e, "We should have picked a destination.");
                    c.mediaElement = d.mediaElement;
                    return {
                        node: e,
                        payload: c,
                        interruptible: !1
                    }
                });
            d.onStart = function() {
                return shaka.log.info("Starting unload...")
            };
            return this.wrapWalkerListenersWithPromise_(d)
        };
        goog.exportProperty(shaka.Player.prototype, "unload", shaka.Player.prototype.unload);
        shaka.Player.prototype.load = function(a, b, c) {
            var d = this;
            if (this.loadMode_ == shaka.Player.LoadMode.DESTROYED) return Promise.reject(this.createAbortLoadError_());
            this.dispatchEvent(new shaka.util.FakeEvent("loading"));
            var e = this.createEmptyPayload_();
            e.uri = a;
            e.startTimeOfLoad = Date.now() / 1E3;
            c && "string" != typeof c && (shaka.Deprecate.deprecateFeature(2, 6, "Loading with a manifest parser factory", "Please register a manifest parser and for the mime-type."), e.factory = function() {
                return new c
            });
            c && "string" == typeof c &&
                (e.mimeType = c);
            void 0 !== b && (e.startTime = b);
            var f = this.shouldUseSrcEquals_(e) ? this.srcEqualsNode_ : this.loadNode_,
                g = this.walker_.startNewRoute(function(a) {
                    if (null == a.mediaElement) return null;
                    e.mediaElement = a.mediaElement;
                    return {
                        node: f,
                        payload: e,
                        interruptible: !0
                    }
                });
            g.onStart = function() {
                return shaka.log.info("Starting load of " + a + "...")
            };
            return new Promise(function(a, b) {
                g.onSkip = function() {
                    return b(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.NO_VIDEO_ELEMENT))
                };
                g.onEnd = function() {
                    return a()
                };
                g.onCancel = function() {
                    return b(d.createAbortLoadError_())
                };
                g.onError = function(a) {
                    return b(a)
                }
            })
        };
        goog.exportProperty(shaka.Player.prototype, "load", shaka.Player.prototype.load);
        shaka.Player.prototype.shouldUseSrcEquals_ = function(a) {
            var b = shaka.util.Platform;
            if (a.factory) return !1;
            if (!b.supportsMediaSource()) return !0;
            var c = a.mimeType,
                d = a.uri || "";
            c || (c = {
                mp4: "video/mp4",
                m4v: "video/mp4",
                m4a: "audio/mp4",
                webm: "video/webm",
                weba: "audio/webm",
                mkv: "video/webm",
                ts: "video/mp2t",
                ogv: "video/ogg",
                ogg: "audio/ogg",
                mpg: "video/mpeg",
                mpeg: "video/mpeg",
                m3u8: "application/x-mpegurl",
                mp3: "audio/mpeg",
                aac: "audio/aac",
                flac: "audio/flac",
                wav: "audio/wav"
            } [shaka.media.ManifestParser.getExtension(d)]);
            if (c) {
                a = "" != (a.mediaElement || b.anyMediaElement()).canPlayType(c);
                if (!a) return !1;
                c = shaka.media.ManifestParser.isSupported(d, c);
                if (!c) return !0;
                goog.asserts.assert(a && c, "Both native and MSE playback should be possible!");
                return b.isApple() && this.config_.streaming.useNativeHlsOnSafari
            }
            return !1
        };
        shaka.Player.prototype.onAttach_ = function(a, b) {
            var c = this;
            goog.asserts.assert(null == a.mediaElement || a.mediaElement == b.mediaElement, "The routing logic failed. MediaElement requirement failed.");
            null == a.mediaElement && (a.mediaElement = b.mediaElement, this.eventManager_.listen(a.mediaElement, "error", function(a) {
                return c.onVideoError_(a)
            }));
            this.video_ = a.mediaElement;
            return Promise.resolve()
        };
        shaka.Player.prototype.onDetach_ = function(a, b) {
            a.mediaElement && (this.eventManager_.unlisten(a.mediaElement, "error"), a.mediaElement = null);
            this.video_ = null;
            return Promise.resolve()
        };
        shaka.Player.prototype.onUnload_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var b;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return c.loadMode_ != shaka.Player.LoadMode.DESTROYED && (c.loadMode_ = shaka.Player.LoadMode.NOT_LOADED), b = c.cleanupOnUnload_.map(function(a) {
                                return a()
                            }), c.cleanupOnUnload_ = [], e.yield(Promise.all(b), 2);
                        case 2:
                            c.dispatchEvent(new shaka.util.FakeEvent("unloading"));
                            a.factory = null;
                            a.mimeType = null;
                            a.startTime = null;
                            a.uri = null;
                            a.mediaElement && (c.eventManager_.unlisten(a.mediaElement, "loadedmetadata"), c.eventManager_.unlisten(a.mediaElement, "playing"), c.eventManager_.unlisten(a.mediaElement, "pause"), c.eventManager_.unlisten(a.mediaElement, "ended"), c.eventManager_.unlisten(a.mediaElement, "ratechange"));
                            c.playheadObservers_ && (c.playheadObservers_.release(), c.playheadObservers_ = null);
                            c.bufferPoller_ && (c.bufferPoller_.stop(), c.bufferPoller_ = null);
                            if (!c.parser_) {
                                e.jumpTo(3);
                                break
                            }
                            return e.yield(c.parser_.stop(),
                                4);
                        case 4:
                            c.parser_ = null;
                        case 3:
                            if (!c.abrManager_) {
                                e.jumpTo(5);
                                break
                            }
                            return e.yield(c.abrManager_.stop(), 5);
                        case 5:
                            if (!c.streamingEngine_) {
                                e.jumpTo(7);
                                break
                            }
                            return e.yield(c.streamingEngine_.destroy(), 8);
                        case 8:
                            c.streamingEngine_ = null;
                        case 7:
                            c.playRateController_ && (c.playRateController_.release(), c.playRateController_ = null);
                            c.playhead_ && (c.playhead_.release(), c.playhead_ = null);
                            if (!c.mediaSourceEngine_) {
                                e.jumpTo(9);
                                break
                            }
                            return e.yield(c.mediaSourceEngine_.destroy(), 10);
                        case 10:
                            c.mediaSourceEngine_ =
                                null;
                        case 9:
                            if (!a.mediaElement || !a.mediaElement.src) {
                                e.jumpTo(11);
                                break
                            }
                            return e.yield(new Promise(function(a) {
                                return (new shaka.util.Timer(a)).tickAfter(.1)
                            }), 12);
                        case 12:
                            a.mediaElement.removeAttribute("src"), a.mediaElement.load();
                        case 11:
                            if (!c.drmEngine_) {
                                e.jumpTo(13);
                                break
                            }
                            return e.yield(c.drmEngine_.destroy(), 14);
                        case 14:
                            c.drmEngine_ = null;
                        case 13:
                            c.activeStreams_.clear(), c.assetUri_ = null, c.bufferObserver_ = null, c.loadingTextStreams_.clear(), c.manifest_ = null, c.stats_ = null, c.lastTextFactory_ = null,
                                c.switchingPeriods_ = !0, c.updateBufferState_(), e.jumpToEnd()
                    }
                })
            })
        };
        shaka.Player.prototype.onInitializeMediaSourceEngine_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return goog.asserts.assert(shaka.util.Platform.supportsMediaSource(), "We should not be initializing media source on a platform that does not support media source."), goog.asserts.assert(a.mediaElement, "We should have a media element when initializing media source."),
                                goog.asserts.assert(a.mediaElement == b.mediaElement, "|has| and |wants| should have the same media element when initializing media source."), goog.asserts.assert(null == c.mediaSourceEngine_, "We should not have a media source engine yet."), f = shaka.media.MuxJSClosedCaptionParser.isSupported() ? new shaka.media.MuxJSClosedCaptionParser : new shaka.media.NoopCaptionParser, g = c.config_.textDisplayFactory, h = new g, c.lastTextFactory_ = g, k = c.createMediaSourceEngine(a.mediaElement, f, h), e.yield(k.open(), 2);
                        case 2:
                            c.mediaSourceEngine_ =
                                k, e.jumpToEnd()
                    }
                })
            })
        };
        shaka.Player.prototype.onInitializeParser_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            goog.asserts.assert(a.mediaElement, "We should have a media element when initializing the parser.");
                            goog.asserts.assert(a.mediaElement == b.mediaElement, "|has| and |wants| should have the same media element when initializing the parser.");
                            goog.asserts.assert(c.networkingEngine_, "Need networking engine when initializing the parser.");
                            goog.asserts.assert(c.config_, "Need player config when initializing the parser.");
                            a.factory = b.factory;
                            a.mimeType = b.mimeType;
                            a.uri = b.uri;
                            goog.asserts.assert(a.uri, "We should have an asset uri when initializing the parsing.");
                            f = a.uri;
                            g = c.networkingEngine_;
                            c.assetUri_ = f;
                            if (a.factory) {
                                c.parser_ = a.factory();
                                e.jumpTo(2);
                                break
                            }
                            h = c;
                            return e.yield(shaka.media.ManifestParser.create(f, g, c.config_.manifest.retryParameters, a.mimeType), 3);
                        case 3:
                            h.parser_ = e.yieldResult;
                        case 2:
                            k = shaka.util.ObjectUtils.cloneObject(c.config_.manifest),
                                b.mediaElement && "AUDIO" === b.mediaElement.nodeName && (k.disableVideo = !0), c.parser_.configure(k), e.jumpToEnd()
                    }
                })
            })
        };
        shaka.Player.prototype.onParseManifest_ = function(a, b) {
            var c = this;
            goog.asserts.assert(a.factory == b.factory, "|has| and |wants| should have the same factory when parsing.");
            goog.asserts.assert(a.mimeType == b.mimeType, "|has| and |wants| should have the same mime type when parsing.");
            goog.asserts.assert(a.uri == b.uri, "|has| and |wants| should have the same uri when parsing.");
            goog.asserts.assert(a.uri, "|has| should have a valid uri when parsing.");
            goog.asserts.assert(a.uri == this.assetUri_, "|has.uri| should match the cached asset uri.");
            goog.asserts.assert(this.networkingEngine_, "Need networking engine to parse manifest.");
            goog.asserts.assert(this.config_, "Need player config to parse manifest.");
            goog.asserts.assert(this.parser_, "|this.parser_| should have been set in an earlier step.");
            var d = a.uri,
                e = this.networkingEngine_;
            this.regionTimeline_ = new shaka.media.RegionTimeline(function() {
                return c.seekRange()
            });
            this.regionTimeline_.setListeners(function(a) {
                c.onRegionEvent_("timelineregionadded", a)
            });
            var f = {
                networkingEngine: e,
                filterNewPeriod: function(a) {
                    return c.filterNewPeriod_(a)
                },
                filterAllPeriods: function(a) {
                    return c.filterAllPeriods_(a)
                },
                onTimelineRegionAdded: function(a) {
                    return c.regionTimeline_.addRegion(a)
                },
                onEvent: function(a) {
                    return c.dispatchEvent(a)
                },
                onError: function(a) {
                    return c.onError_(a)
                }
            };
            return new shaka.util.AbortableOperation(Promise.resolve().then(function() {
                return $jscomp.asyncExecutePromiseGeneratorFunction(function h() {
                    var a;
                    return $jscomp.generator.createGenerator(h, function(b) {
                        switch (b.nextAddress) {
                            case 1:
                                return a = c, b.yield(c.parser_.start(d, f), 2);
                            case 2:
                                a.manifest_ =
                                    b.yieldResult;
                                c.dispatchEvent(new shaka.util.FakeEvent("manifestparsed"));
                                if (0 == c.manifest_.periods.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.NO_PERIODS);
                                shaka.Player.filterForAVVariants_(c.manifest_.periods);
                                b.jumpToEnd()
                        }
                    })
                })
            }), function() {
                shaka.log.info("Aborting parser step...");
                return c.parser_.stop()
            })
        };
        shaka.Player.prototype.onInitializeDrm_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return goog.asserts.assert(a.factory == b.factory, "The load graph should have ensured the factories matched."), goog.asserts.assert(a.mimeType == b.mimeType, "The load graph should have ensured the mime types matched."), goog.asserts.assert(a.uri == b.uri, "The load graph should have ensured the uris matched"),
                                goog.asserts.assert(c.networkingEngine_, "|onInitializeDrm_| should never be called after |destroy|"), goog.asserts.assert(c.config_, "|onInitializeDrm_| should never be called after |destroy|"), goog.asserts.assert(c.manifest_, "|this.manifest_| should have been set in an earlier step."), c.drmEngine_ = c.createDrmEngine({
                                    netEngine: c.networkingEngine_,
                                    onError: function(a) {
                                        c.onError_(a)
                                    },
                                    onKeyStatus: function(a) {
                                        c.onKeyStatus_(a)
                                    },
                                    onExpirationUpdated: function(a, b) {
                                        c.onExpirationUpdated_(a, b)
                                    },
                                    onEvent: function(a) {
                                        c.dispatchEvent(a)
                                    }
                                }),
                                c.drmEngine_.configure(c.config_.drm), e.yield(c.drmEngine_.initForPlayback(shaka.util.Periods.getAllVariantsFrom(c.manifest_.periods), c.manifest_.offlineSessionIds), 2);
                        case 2:
                            c.filterAllPeriods_(c.manifest_.periods), e.jumpToEnd()
                    }
                })
            })
        };
        shaka.Player.prototype.onLoad_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l, m, n, q, p, t;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return goog.asserts.assert(a.factory == b.factory, "|has| and |wants| should have the same factory when loading."), goog.asserts.assert(a.mimeType == b.mimeType, "|has| and |wants| should have the same mime type when loading."), goog.asserts.assert(a.uri == b.uri, "|has| and |wants| should have the same uri when loading."),
                                goog.asserts.assert(a.mediaElement, "We should have a media element when loading."), goog.asserts.assert(b.startTimeOfLoad, "|wants| should tell us when the load was originally requested"), a.startTime = b.startTime, f = a.mediaElement, g = a.uri, c.assetUri_ = g, c.playRateController_ = new shaka.media.PlayRateController({
                                    getRate: function() {
                                        return a.mediaElement.playbackRate
                                    },
                                    setRate: function(b) {
                                        a.mediaElement.playbackRate = b
                                    },
                                    movePlayhead: function(b) {
                                        a.mediaElement.currentTime += b
                                    }
                                }), c.stats_ = new shaka.util.Stats,
                                h = function() {
                                    return c.updateStateHistory_()
                                }, k = function() {
                                    return c.onRateChange_()
                                }, c.eventManager_.listen(f, "playing", h), c.eventManager_.listen(f, "pause", h), c.eventManager_.listen(f, "ended", h), c.eventManager_.listen(f, "ratechange", k), l = c.config_.abrFactory, c.abrManager_ && c.abrManagerFactory_ == l || (c.abrManagerFactory_ = l, c.abrManager_ = new l, c.abrManager_.configure(c.config_.abr)), c.createTextStreamsForClosedCaptions_(c.manifest_.periods), c.currentAdaptationSetCriteria_ = new shaka.media.PreferenceBasedCriteria(c.config_.preferredAudioLanguage,
                                    c.config_.preferredVariantRole, c.config_.preferredAudioChannelCount), c.currentTextLanguage_ = c.config_.preferredTextLanguage, shaka.Player.applyPlayRange_(c.manifest_.presentationTimeline, c.config_.playRangeStart, c.config_.playRangeEnd), e.yield(c.drmEngine_.attach(f), 2);
                        case 2:
                            return c.abrManager_.init(function(a, b, e) {
                                    return c.switch_(a, b, e)
                                }), c.playhead_ = c.createPlayhead(a.startTime), c.playheadObservers_ = c.createPlayheadObserversForMSE_(), m = Math.max(c.manifest_.minBufferTime, c.config_.streaming.rebufferingGoal),
                                c.startBufferManagement_(m), c.streamingEngine_ = c.createStreamingEngine(), c.streamingEngine_.configure(c.config_.streaming), shaka.util.StreamUtils.chooseCodecsAndFilterManifest(c.manifest_, c.config_.preferredAudioChannelCount), c.loadMode_ = shaka.Player.LoadMode.MEDIA_SOURCE, c.dispatchEvent(new shaka.util.FakeEvent("streaming")), e.yield(c.streamingEngine_.start(), 3);
                        case 3:
                            c.config_.streaming.startAtSegmentBoundary && (n = c.playhead_.getTime(), q = c.adjustStartTime_(n), c.playhead_.setStartTime(q)), c.manifest_.periods.forEach(c.filterNewPeriod_.bind(c)),
                                c.onTracksChanged_(), c.onAdaptation_(), p = c.getPresentationPeriod_() || c.manifest_.periods[0], t = p.variants.some(function(a) {
                                    return a.primary
                                }), c.config_.preferredAudioLanguage || t || shaka.log.warning("No preferred audio language set.  We will choose an arbitrary language initially"), c.chooseVariant_(p.variants), c.eventManager_.listenOnce(f, "loadedmetadata", function() {
                                    var a = Date.now() / 1E3 - b.startTimeOfLoad;
                                    c.stats_.setLoadLatency(a)
                                }), e.jumpToEnd()
                    }
                })
            })
        };
        shaka.Player.prototype.onInitializeSrcEqualsDrm_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var b, g;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return b = shaka.util.ManifestParserUtils.ContentType, goog.asserts.assert(c.networkingEngine_, "|onInitializeSrcEqualsDrm_| should never be called after |destroy|"), goog.asserts.assert(c.config_, "|onInitializeSrcEqualsDrm_| should never be called after |destroy|"), c.drmEngine_ =
                                c.createDrmEngine({
                                    netEngine: c.networkingEngine_,
                                    onError: function(a) {
                                        c.onError_(a)
                                    },
                                    onKeyStatus: function(a) {
                                        c.onKeyStatus_(a)
                                    },
                                    onExpirationUpdated: function(a, b) {
                                        c.onExpirationUpdated_(a, b)
                                    },
                                    onEvent: function(a) {
                                        c.dispatchEvent(a)
                                    }
                                }), c.drmEngine_.configure(c.config_.drm), g = {
                                    id: 0,
                                    language: "und",
                                    primary: !1,
                                    audio: null,
                                    video: {
                                        id: 0,
                                        originalId: null,
                                        createSegmentIndex: Promise.resolve.bind(Promise),
                                        findSegmentPosition: function(a) {
                                            return null
                                        },
                                        getSegmentReference: function(a) {
                                            return null
                                        },
                                        initSegmentReference: null,
                                        presentationTimeOffset: 0,
                                        mimeType: "video/mp4",
                                        codecs: "",
                                        encrypted: !0,
                                        keyId: null,
                                        language: "und",
                                        label: null,
                                        type: b.VIDEO,
                                        primary: !1,
                                        frameRate: void 0,
                                        pixelAspectRatio: void 0,
                                        trickModeVideo: null,
                                        emsgSchemeIdUris: null,
                                        roles: [],
                                        channelsCount: null,
                                        audioSamplingRate: null,
                                        closedCaptions: null
                                    },
                                    bandwidth: 100,
                                    drmInfos: [],
                                    allowedByApplication: !0,
                                    allowedByKeySystem: !0
                                }, e.yield(c.drmEngine_.initForPlayback([g], []), 2);
                        case 2:
                            return e.yield(c.drmEngine_.attach(a.mediaElement), 0)
                    }
                })
            })
        };
        shaka.Player.prototype.onSrcEquals_ = function(a, b) {
            var c = this;
            goog.asserts.assert(a.mediaElement, "We should have a media element when loading.");
            goog.asserts.assert(b.uri, "|has| should have a valid uri when loading.");
            goog.asserts.assert(b.startTimeOfLoad, "|wants| should tell us when the load was originally requested");
            goog.asserts.assert(this.video_ == a.mediaElement, "The video element should match our media element");
            a.uri = b.uri;
            a.startTime = b.startTime;
            this.assetUri_ = a.uri;
            this.stats_ = new shaka.util.Stats;
            this.playhead_ = new shaka.media.SrcEqualsPlayhead(a.mediaElement);
            null != a.startTime && this.playhead_.setStartTime(a.startTime);
            this.playRateController_ = new shaka.media.PlayRateController({
                getRate: function() {
                    return a.mediaElement.playbackRate
                },
                setRate: function(b) {
                    a.mediaElement.playbackRate = b
                },
                movePlayhead: function(b) {
                    a.mediaElement.currentTime += b
                }
            });
            this.startBufferManagement_(this.config_.streaming.rebufferingGoal);
            var d = function() {
                return c.updateStateHistory_()
            };
            this.eventManager_.listen(a.mediaElement,
                "playing", d);
            this.eventManager_.listen(a.mediaElement, "pause", d);
            this.eventManager_.listen(a.mediaElement, "ended", d);
            this.eventManager_.listen(a.mediaElement, "ratechange", function() {
                return c.onRateChange_()
            });
            "none" != this.video_.preload && this.eventManager_.listenOnce(a.mediaElement, "loadedmetadata", function() {
                var a = Date.now() / 1E3 - b.startTimeOfLoad;
                c.stats_.setLoadLatency(a)
            });
            this.video_.audioTracks && (this.eventManager_.listen(this.video_.audioTracks, "addtrack", function() {
                    return c.onTracksChanged_()
                }),
                this.eventManager_.listen(this.video_.audioTracks, "removetrack", function() {
                    return c.onTracksChanged_()
                }), this.eventManager_.listen(this.video_.audioTracks, "change", function() {
                    return c.onTracksChanged_()
                }));
            this.video_.textTracks && (d = this.video_.textTracks, this.eventManager_.listen(d, "addtrack", function() {
                return c.onTracksChanged_()
            }), this.eventManager_.listen(d, "removetrack", function() {
                return c.onTracksChanged_()
            }), this.eventManager_.listen(d, "change", function() {
                return c.onTracksChanged_()
            }));
            a.mediaElement.src =
                a.uri;
            (shaka.util.Platform.isTizen() || shaka.util.Platform.isWebOS()) && a.mediaElement.load();
            this.loadMode_ = shaka.Player.LoadMode.SRC_EQUALS;
            this.dispatchEvent(new shaka.util.FakeEvent("streaming"));
            var e = new shaka.util.PublicPromise;
            shaka.util.MediaReadyState.waitForReadyState(this.video_, HTMLMediaElement.HAVE_METADATA, this.eventManager_, function() {
                e.resolve()
            });
            var f = !1;
            this.cleanupOnUnload_.push(function() {
                f = !0
            });
            shaka.util.MediaReadyState.waitForReadyState(this.video_, HTMLMediaElement.HAVE_CURRENT_DATA,
                this.eventManager_,
                function() {
                    return $jscomp.asyncExecutePromiseGeneratorFunction(function h() {
                        var a;
                        return $jscomp.generator.createGenerator(h, function(b) {
                            switch (b.nextAddress) {
                                case 1:
                                    if (f) return b["return"]();
                                    c.setupPreferredAudioOnSrc_();
                                    a = c.filterTextTracks_();
                                    if (a.find(function(a) {
                                            return "disabled" != a.mode
                                        })) {
                                        b.jumpTo(2);
                                        break
                                    }
                                    return b.yield(new Promise(function(a) {
                                        c.eventManager_.listenOnce(c.video_.textTracks, "change", a);
                                        (new shaka.util.Timer(a)).tickAfter(1)
                                    }), 2);
                                case 2:
                                    if (f) return b["return"]();
                                    c.setupPreferredTextOnSrc_();
                                    b.jumpToEnd()
                            }
                        })
                    })
                });
            this.video_.error ? e.reject(this.videoErrorToShakaError_()) : "none" == this.video_.preload && (shaka.log.alwaysWarn('With <video preload="none">, the browser will not load anything until play() is called. We are unable to measure load latency in a meaningful way, and we cannot provide track info yet. Please do not use preload="none" with Shaka Player.'), e.resolve());
            this.eventManager_.listenOnce(this.video_, "error", function() {
                e.reject(c.videoErrorToShakaError_())
            });
            return new shaka.util.AbortableOperation(e, function() {
                var a = new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.OPERATION_ABORTED);
                e.reject(a);
                return Promise.resolve()
            })
        };
        shaka.Player.prototype.setupPreferredAudioOnSrc_ = function() {
            var a = this.config_.preferredAudioLanguage;
            if ("" != a) {
                this.selectAudioLanguage(a);
                var b = this.config_.preferredVariantRole;
                "" != b && this.selectAudioLanguage(a, b)
            }
        };
        shaka.Player.prototype.setupPreferredTextOnSrc_ = function() {
            var a = this.config_.preferredTextLanguage;
            if ("" != a) {
                this.selectTextLanguage(a);
                var b = this.config_.preferredTextRole;
                "" != b && this.selectTextLanguage(a, b)
            }
        };
        shaka.Player.filterForAVVariants_ = function(a) {
            var b = function(a) {
                return a.video && a.audio || a.video && a.video.codecs.includes(",")
            };
            a.some(function(a) {
                return a.variants.some(b)
            }) && (shaka.log.debug("Found variant with audio and video content, so filtering out audio-only content in all periods."), a.forEach(function(a) {
                a.variants = a.variants.filter(b)
            }))
        };
        shaka.Player.prototype.createDrmEngine = function(a) {
            return new shaka.media.DrmEngine(a, this.config_.drm.updateExpirationTime)
        };
        shaka.Player.prototype.createNetworkingEngine = function() {
            var a = this;
            return new shaka.net.NetworkingEngine(function(b, c) {
                a.abrManager_ && a.abrManager_.segmentDownloaded(b, c)
            })
        };
        shaka.Player.prototype.createPlayhead = function(a) {
            var b = this;
            goog.asserts.assert(this.manifest_, "Must have manifest");
            goog.asserts.assert(this.video_, "Must have video");
            return new shaka.media.MediaSourcePlayhead(this.video_, this.manifest_, this.config_.streaming, a, function() {
                return b.onSeek_()
            }, function(a) {
                return b.dispatchEvent(a)
            })
        };
        shaka.Player.prototype.createPlayheadObserversForMSE_ = function() {
            var a = this;
            goog.asserts.assert(this.manifest_, "Must have manifest");
            goog.asserts.assert(this.regionTimeline_, "Must have region timeline");
            goog.asserts.assert(this.video_, "Must have video element");
            var b = new shaka.media.PeriodObserver(this.manifest_);
            b.setListeners(function(b) {
                return a.onChangePeriod_()
            });
            var c = new shaka.media.RegionObserver(this.regionTimeline_);
            c.setListeners(function(b, c) {
                    a.onRegionEvent_("timelineregionenter", b)
                },
                function(b, c) {
                    a.onRegionEvent_("timelineregionexit", b)
                },
                function(b, c) {
                    c || (a.onRegionEvent_("timelineregionenter", b), a.onRegionEvent_("timelineregionexit", b))
                });
            var d = new shaka.media.PlayheadObserverManager(this.video_);
            d.manage(b);
            d.manage(c);
            return d
        };
        shaka.Player.prototype.startBufferManagement_ = function(a) {
            var b = this;
            goog.asserts.assert(!this.bufferObserver_, "No buffering observer should exist before initialization.");
            goog.asserts.assert(!this.bufferPoller_, "No buffer timer should exist before initialization.");
            this.bufferObserver_ = new shaka.media.BufferingObserver(1, 2);
            this.bufferObserver_.setState(shaka.media.BufferingObserver.State.STARVING);
            this.updateBufferingSettings_(a);
            this.updateBufferState_();
            this.bufferPoller_ = (new shaka.util.Timer(function() {
                b.pollBufferState_()
            })).tickEvery(.25)
        };
        shaka.Player.prototype.updateBufferingSettings_ = function(a) {
            this.bufferObserver_.setThresholds(a, Math.min(shaka.Player.TYPICAL_BUFFERING_THRESHOLD_, a / 2))
        };
        shaka.Player.prototype.pollBufferState_ = function() {
            goog.asserts.assert(this.video_, "Need a media element to update the buffering observer");
            goog.asserts.assert(this.bufferObserver_, "Need a buffering observer to update");
            switch (this.loadMode_) {
                case shaka.Player.LoadMode.SRC_EQUALS:
                    var a = this.isBufferedToEndSrc_();
                    break;
                case shaka.Player.LoadMode.MEDIA_SOURCE:
                    a = this.isBufferedToEndMS_();
                    break;
                default:
                    a = !1
            }
            var b = shaka.media.TimeRangesUtils.bufferedAheadOf(this.video_.buffered, this.video_.currentTime);
            this.bufferObserver_.update(b, a) && this.updateBufferState_()
        };
        shaka.Player.prototype.createMediaSourceEngine = function(a, b, c) {
            return new shaka.media.MediaSourceEngine(a, b, c)
        };
        shaka.Player.prototype.createStreamingEngine = function() {
            var a = this;
            goog.asserts.assert(this.playhead_ && this.abrManager_ && this.mediaSourceEngine_ && this.manifest_, "Must not be destroyed");
            var b = {
                getPresentationTime: function() {
                    return a.playhead_.getTime()
                },
                getBandwidthEstimate: function() {
                    return a.abrManager_.getBandwidthEstimate()
                },
                mediaSourceEngine: this.mediaSourceEngine_,
                netEngine: this.networkingEngine_,
                onChooseStreams: this.onChooseStreams_.bind(this),
                onCanSwitch: this.canSwitch_.bind(this),
                onError: this.onError_.bind(this),
                onEvent: function(b) {
                    return a.dispatchEvent(b)
                },
                onManifestUpdate: this.onManifestUpdate_.bind(this),
                onSegmentAppended: this.onSegmentAppended_.bind(this)
            };
            return new shaka.media.StreamingEngine(this.manifest_, b)
        };
        shaka.Player.prototype.configure = function(a, b) {
            goog.asserts.assert(this.config_, "Config must not be null!");
            goog.asserts.assert("object" == typeof a || 2 == arguments.length, "String configs should have values!");
            2 == arguments.length && "string" == typeof a && (a = shaka.util.ConfigUtils.convertToConfigObject(a, b));
            goog.asserts.assert("object" == typeof a, "Should be an object!");
            var c = shaka.util.PlayerConfiguration.mergeConfigObjects(this.config_, a, this.defaultConfig_());
            this.applyConfig_();
            return c
        };
        goog.exportProperty(shaka.Player.prototype, "configure", shaka.Player.prototype.configure);
        shaka.Player.prototype.applyConfig_ = function() {
            if (this.parser_) {
                var a = shaka.util.ObjectUtils.cloneObject(this.config_.manifest);
                this.video_ && "AUDIO" === this.video_.nodeName && (a.disableVideo = !0);
                this.parser_.configure(a)
            }
            this.drmEngine_ && this.drmEngine_.configure(this.config_.drm);
            if (this.streamingEngine_) {
                this.streamingEngine_.configure(this.config_.streaming);
                try {
                    this.manifest_.periods.forEach(this.filterNewPeriod_.bind(this))
                } catch (d) {
                    this.onError_(d)
                }
                var b = this.streamingEngine_.getBufferingAudio(),
                    c = this.streamingEngine_.getBufferingVideo();
                a = this.getPresentationPeriod_();
                b = shaka.util.StreamUtils.getVariantByStreams(b, c, a.variants);
                this.abrManager_ && b && b.allowedByApplication && b.allowedByKeySystem ? this.chooseVariant_(a.variants) : (shaka.log.debug("Choosing new streams after changing configuration"), this.chooseStreamsAndSwitch_(a))
            }
            this.mediaSourceEngine_ && (a = this.config_.textDisplayFactory, this.lastTextFactory_ != a && (b = new a, this.mediaSourceEngine_.setTextDisplayer(b), this.lastTextFactory_ = a,
                this.streamingEngine_ && this.streamingEngine_.reloadTextStream()));
            this.abrManager_ && (this.abrManager_.configure(this.config_.abr), this.config_.abr.enabled && !this.switchingPeriods_ ? this.abrManager_.enable() : this.abrManager_.disable(), this.onAbrStatusChanged_());
            this.bufferObserver_ && (a = this.config_.streaming.rebufferingGoal, this.manifest_ && (a = Math.max(a, this.manifest_.minBufferTime)), this.updateBufferingSettings_(a))
        };
        shaka.Player.prototype.getConfiguration = function() {
            goog.asserts.assert(this.config_, "Config must not be null!");
            var a = this.defaultConfig_();
            shaka.util.PlayerConfiguration.mergeConfigObjects(a, this.config_, this.defaultConfig_());
            return a
        };
        goog.exportProperty(shaka.Player.prototype, "getConfiguration", shaka.Player.prototype.getConfiguration);
        shaka.Player.prototype.getSharedConfiguration = function() {
            goog.asserts.assert(this.config_, "Cannot call getSharedConfiguration after call destroy!");
            return this.config_
        };
        shaka.Player.prototype.resetConfiguration = function() {
            goog.asserts.assert(this.config_, "Cannot be destroyed");
            for (var a in this.config_) delete this.config_[a];
            shaka.util.PlayerConfiguration.mergeConfigObjects(this.config_, this.defaultConfig_(), this.defaultConfig_());
            this.applyConfig_()
        };
        goog.exportProperty(shaka.Player.prototype, "resetConfiguration", shaka.Player.prototype.resetConfiguration);
        shaka.Player.prototype.getLoadMode = function() {
            return this.loadMode_
        };
        goog.exportProperty(shaka.Player.prototype, "getLoadMode", shaka.Player.prototype.getLoadMode);
        shaka.Player.prototype.getMediaElement = function() {
            return this.video_
        };
        goog.exportProperty(shaka.Player.prototype, "getMediaElement", shaka.Player.prototype.getMediaElement);
        shaka.Player.prototype.getNetworkingEngine = function() {
            return this.networkingEngine_
        };
        goog.exportProperty(shaka.Player.prototype, "getNetworkingEngine", shaka.Player.prototype.getNetworkingEngine);
        shaka.Player.prototype.getAssetUri = function() {
            return this.assetUri_
        };
        goog.exportProperty(shaka.Player.prototype, "getAssetUri", shaka.Player.prototype.getAssetUri);
        shaka.Player.prototype.getManifestUri = function() {
            shaka.Deprecate.deprecateFeature(2, 6, "getManifestUri", 'Please use "getAssetUri" instead.');
            return this.getAssetUri()
        };
        goog.exportProperty(shaka.Player.prototype, "getManifestUri", shaka.Player.prototype.getManifestUri);
        shaka.Player.prototype.isLive = function() {
            return this.manifest_ ? this.manifest_.presentationTimeline.isLive() : this.video_ && this.video_.src ? Infinity == this.video_.duration : !1
        };
        goog.exportProperty(shaka.Player.prototype, "isLive", shaka.Player.prototype.isLive);
        shaka.Player.prototype.isInProgress = function() {
            return this.manifest_ ? this.manifest_.presentationTimeline.isInProgress() : !1
        };
        goog.exportProperty(shaka.Player.prototype, "isInProgress", shaka.Player.prototype.isInProgress);
        shaka.Player.prototype.isAudioOnly = function() {
            if (this.manifest_) {
                if (!this.manifest_.periods.length) return !1;
                var a = this.manifest_.periods[0].variants;
                return a.length ? !a[0].video : !1
            }
            return this.video_ && this.video_.src ? this.video_.videoTracks ? 0 == this.video_.videoTracks.length : 0 == this.video_.videoHeight : !1
        };
        goog.exportProperty(shaka.Player.prototype, "isAudioOnly", shaka.Player.prototype.isAudioOnly);
        shaka.Player.prototype.seekRange = function() {
            if (this.manifest_) {
                var a = this.manifest_.presentationTimeline;
                return {
                    start: a.getSeekRangeStart(),
                    end: a.getSeekRangeEnd()
                }
            }
            return this.video_ && this.video_.src && (a = this.video_.seekable, a.length) ? {
                start: a.start(0),
                end: a.end(a.length - 1)
            } : {
                start: 0,
                end: 0
            }
        };
        goog.exportProperty(shaka.Player.prototype, "seekRange", shaka.Player.prototype.seekRange);
        shaka.Player.prototype.keySystem = function() {
            return shaka.media.DrmEngine.keySystem(this.drmInfo())
        };
        goog.exportProperty(shaka.Player.prototype, "keySystem", shaka.Player.prototype.keySystem);
        shaka.Player.prototype.drmInfo = function() {
            return this.drmEngine_ ? this.drmEngine_.getDrmInfo() : null
        };
        goog.exportProperty(shaka.Player.prototype, "drmInfo", shaka.Player.prototype.drmInfo);
        shaka.Player.prototype.getExpiration = function() {
            return this.drmEngine_ ? this.drmEngine_.getExpiration() : Infinity
        };
        goog.exportProperty(shaka.Player.prototype, "getExpiration", shaka.Player.prototype.getExpiration);
        shaka.Player.prototype.isBuffering = function() {
            var a = shaka.media.BufferingObserver.State;
            return this.bufferObserver_ ? this.bufferObserver_.getState() == a.STARVING : !1
        };
        goog.exportProperty(shaka.Player.prototype, "isBuffering", shaka.Player.prototype.isBuffering);
        shaka.Player.prototype.getPlaybackRate = function() {
            return this.playRateController_ ? this.playRateController_.getActiveRate() : 0
        };
        goog.exportProperty(shaka.Player.prototype, "getPlaybackRate", shaka.Player.prototype.getPlaybackRate);
        shaka.Player.prototype.trickPlay = function(a) {
            goog.asserts.assert(0 != a, "Should never set a trick play rate of 0!");
            0 == a ? shaka.log.alwaysWarn("A trick play rate of 0 is unsupported!") : (this.video_.paused && this.video_.play(), this.playRateController_ && this.playRateController_.set(a), this.loadMode_ == shaka.Player.LoadMode.MEDIA_SOURCE && this.streamingEngine_.setTrickPlay(1 < Math.abs(a)))
        };
        goog.exportProperty(shaka.Player.prototype, "trickPlay", shaka.Player.prototype.trickPlay);
        shaka.Player.prototype.cancelTrickPlay = function() {
            this.loadMode_ == shaka.Player.LoadMode.SRC_EQUALS && this.playRateController_.set(1);
            this.loadMode_ == shaka.Player.LoadMode.MEDIA_SOURCE && (this.playRateController_.set(1), this.streamingEngine_.setTrickPlay(!1))
        };
        goog.exportProperty(shaka.Player.prototype, "cancelTrickPlay", shaka.Player.prototype.cancelTrickPlay);
        shaka.Player.prototype.getVariantTracks = function() {
            if (this.manifest_ && this.playhead_) {
                for (var a = this.getPresentationVariant_(), b = [], c = $jscomp.makeIterator(this.getSelectableVariants_()), d = c.next(); !d.done; d = c.next()) {
                    d = d.value;
                    var e = shaka.util.StreamUtils.variantToTrack(d);
                    e.active = d == a;
                    b.push(e)
                }
                return b
            }
            return this.video_ && this.video_.audioTracks ? Array.from(this.video_.audioTracks).map(function(a) {
                return shaka.util.StreamUtils.html5AudioTrackToTrack(a)
            }) : []
        };
        goog.exportProperty(shaka.Player.prototype, "getVariantTracks", shaka.Player.prototype.getVariantTracks);
        shaka.Player.prototype.getTextTracks = function() {
            if (this.manifest_ && this.playhead_) {
                for (var a = this.getPresentationText_(), b = [], c = $jscomp.makeIterator(this.getSelectableText_()), d = c.next(); !d.done; d = c.next()) {
                    d = d.value;
                    var e = shaka.util.StreamUtils.textStreamToTrack(d);
                    e.active = d == a;
                    b.push(e)
                }
                return b
            }
            if (this.video_ && this.video_.src && this.video_.textTracks) {
                a = this.filterTextTracks_();
                var f = shaka.util.StreamUtils;
                return a.map(function(a) {
                    return f.html5TextTrackToTrack(a)
                })
            }
            return []
        };
        goog.exportProperty(shaka.Player.prototype, "getTextTracks", shaka.Player.prototype.getTextTracks);
        shaka.Player.prototype.selectTextTrack = function(a) {
            if (this.manifest_ && this.streamingEngine_) {
                var b = this.getPresentationPeriod_(),
                    c = b.textStreams.find(function(b) {
                        return b.id == a.id
                    });
                c ? (this.addTextStreamToSwitchHistory_(b, c, !1), this.switchTextStream_(c), this.currentTextLanguage_ = c.language) : shaka.log.error("No stream with id", a.id)
            } else if (this.video_ && this.video_.src && this.video_.textTracks) {
                b = this.filterTextTracks_();
                b = $jscomp.makeIterator(b);
                for (c = b.next(); !c.done; c = b.next()) c = c.value, shaka.util.StreamUtils.html5TrackId(c) ==
                    a.id ? c.mode = this.isTextVisible_ ? "showing" : "hidden" : c.mode = "disabled";
                this.onTextChanged_()
            }
        };
        goog.exportProperty(shaka.Player.prototype, "selectTextTrack", shaka.Player.prototype.selectTextTrack);
        shaka.Player.prototype.selectEmbeddedTextTrack = function() {
            shaka.Deprecate.deprecateFeature(2, 6, "selectEmbeddedTextTrack", "If closed captions are signaled in the manifest, a text stream will be created to represent them. Please use SelectTextTrack.");
            var a = this.getTextTracks().filter(function(a) {
                return a.mimeType == shaka.util.MimeUtils.CLOSED_CAPTION_MIMETYPE
            });
            0 < a.length ? this.selectTextTrack(a[0]) : shaka.log.warning("Unable to find the text track embedded in the video.")
        };
        goog.exportProperty(shaka.Player.prototype, "selectEmbeddedTextTrack", shaka.Player.prototype.selectEmbeddedTextTrack);
        shaka.Player.prototype.usingEmbeddedTextTrack = function() {
            shaka.Deprecate.deprecateFeature(2, 6, "usingEmbeddedTextTrack", "If closed captions are signaled in the manifest, a text stream will be created to represent them. There should be no reason to know if the player is playing embedded text.");
            var a = this.getTextTracks().filter(function(a) {
                return a.active
            })[0];
            return a ? a.mimeType == shaka.util.MimeUtils.CLOSED_CAPTION_MIMETYPE : !1
        };
        goog.exportProperty(shaka.Player.prototype, "usingEmbeddedTextTrack", shaka.Player.prototype.usingEmbeddedTextTrack);
        shaka.Player.prototype.selectVariantTrack = function(a, b, c) {
            c = void 0 === c ? 0 : c;
            if (this.manifest_ && this.streamingEngine_) {
                var d = this.getPresentationPeriod_();
                this.config_.abr.enabled && shaka.log.alwaysWarn("Changing tracks while abr manager is enabled will likely result in the selected track being overriden. Consider disabling abr before calling selectVariantTrack().");
                var e = d.variants.find(function(b) {
                    return b.id == a.id
                });
                e ? shaka.util.StreamUtils.isPlayable(e) ? (this.addVariantToSwitchHistory_(d, e, !1), this.switchVariant_(e,
                    b, c), this.currentAdaptationSetCriteria_ = new shaka.media.ExampleBasedCriteria(e), this.chooseVariant_(d.variants)) : shaka.log.error("Unable to switch to restricted track", a.id) : shaka.log.error("No variant with id", a.id)
            } else if (this.video_ && this.video_.audioTracks) {
                b = Array.from(this.video_.audioTracks);
                b = $jscomp.makeIterator(b);
                for (c = b.next(); !c.done; c = b.next()) c = c.value, shaka.util.StreamUtils.html5TrackId(c) == a.id && (c.enabled = !0);
                this.onVariantChanged_()
            }
        };
        goog.exportProperty(shaka.Player.prototype, "selectVariantTrack", shaka.Player.prototype.selectVariantTrack);
        shaka.Player.prototype.getAudioLanguagesAndRoles = function() {
            return shaka.Player.getLanguageAndRolesFrom_(this.getVariantTracks())
        };
        goog.exportProperty(shaka.Player.prototype, "getAudioLanguagesAndRoles", shaka.Player.prototype.getAudioLanguagesAndRoles);
        shaka.Player.prototype.getTextLanguagesAndRoles = function() {
            return shaka.Player.getLanguageAndRolesFrom_(this.getTextTracks())
        };
        goog.exportProperty(shaka.Player.prototype, "getTextLanguagesAndRoles", shaka.Player.prototype.getTextLanguagesAndRoles);
        shaka.Player.prototype.getAudioLanguages = function() {
            return Array.from(shaka.Player.getLanguagesFrom_(this.getVariantTracks()))
        };
        goog.exportProperty(shaka.Player.prototype, "getAudioLanguages", shaka.Player.prototype.getAudioLanguages);
        shaka.Player.prototype.getTextLanguages = function() {
            return Array.from(shaka.Player.getLanguagesFrom_(this.getTextTracks()))
        };
        goog.exportProperty(shaka.Player.prototype, "getTextLanguages", shaka.Player.prototype.getTextLanguages);
        shaka.Player.prototype.selectAudioLanguage = function(a, b) {
            var c = shaka.util.LanguageUtils;
            if (this.manifest_ && this.playhead_) c = this.getPresentationPeriod_(), this.currentAdaptationSetCriteria_ = new shaka.media.PreferenceBasedCriteria(a, b || "", 0, ""), this.chooseVariantAndSwitch_(c);
            else if (this.video_ && this.video_.audioTracks) {
                var d = Array.from(this.video_.audioTracks),
                    e = c.normalize(a),
                    f = null,
                    g = null;
                d = $jscomp.makeIterator(d);
                for (var h = d.next(); !h.done; h = d.next()) {
                    h = h.value;
                    var k = shaka.util.StreamUtils.html5AudioTrackToTrack(h);
                    c.normalize(k.language) == e && (f = h, b ? k.roles.includes(b) && (g = h) : 0 == k.roles.length && (g = h))
                }
                g ? (g.enabled = !0, this.onVariantChanged_()) : f && (f.enabled = !0, this.onVariantChanged_())
            }
        };
        goog.exportProperty(shaka.Player.prototype, "selectAudioLanguage", shaka.Player.prototype.selectAudioLanguage);
        shaka.Player.prototype.selectTextLanguage = function(a, b) {
            var c = shaka.util.LanguageUtils;
            if (this.manifest_ && this.playhead_) {
                var d = this.getPresentationPeriod_();
                this.currentTextLanguage_ = a;
                this.currentTextRole_ = b || "";
                var e = this.chooseTextStream_(d.textStreams);
                e && (this.addTextStreamToSwitchHistory_(d, e, !1), this.shouldStreamText_() && this.switchTextStream_(e))
            } else {
                var f = c.normalize(a);
                (d = this.getTextTracks().filter(function(a) {
                    return c.normalize(a.language) == f && (!b || a.roles.includes(b))
                })[0]) && this.selectTextTrack(d)
            }
        };
        goog.exportProperty(shaka.Player.prototype, "selectTextLanguage", shaka.Player.prototype.selectTextLanguage);
        shaka.Player.prototype.selectVariantsByLabel = function(a) {
            if (this.manifest_ && this.playhead_) {
                for (var b = this.getPresentationPeriod_(), c = null, d = $jscomp.makeIterator(this.getSelectableVariants_()), e = d.next(); !e.done; e = d.next())
                    if (e = e.value, e.audio.label == a) {
                        c = e;
                        break
                    } null == c ? shaka.log.warning("No variants were found with label: " + a + ". Ignoring the request to switch.") : (this.currentAdaptationSetCriteria_ = new shaka.media.PreferenceBasedCriteria(c.language, "", 0, a), this.chooseVariantAndSwitch_(b))
            }
        };
        goog.exportProperty(shaka.Player.prototype, "selectVariantsByLabel", shaka.Player.prototype.selectVariantsByLabel);
        shaka.Player.prototype.isTextTrackVisible = function() {
            var a = this.isTextVisible_;
            if (this.mediaSourceEngine_) {
                var b = this.mediaSourceEngine_.getTextDisplayer().isTextVisible();
                goog.asserts.assert(b == a, "text visibility has fallen out of sync");
                return b
            }
            return this.video_ && this.video_.src && this.video_.textTracks ? this.filterTextTracks_().some(function(a) {
                return "showing" == a.mode
            }) : a
        };
        goog.exportProperty(shaka.Player.prototype, "isTextTrackVisible", shaka.Player.prototype.isTextTrackVisible);
        shaka.Player.prototype.filterTextTracks_ = function() {
            goog.asserts.assert(this.video_.textTracks, "TextTracks should be valid.");
            return Array.from(this.video_.textTracks).filter(function(a) {
                return "metadata" != a.kind && "chapters" != a.kind && a.label != shaka.Player.TextTrackLabel
            })
        };
        shaka.Player.prototype.setTextTrackVisibility = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            e = b.isTextVisible_;
                            f = !!a;
                            if (e == f) return d["return"]();
                            b.isTextVisible_ = f;
                            if (b.loadMode_ != shaka.Player.LoadMode.MEDIA_SOURCE) {
                                if (b.video_ && b.video_.src && b.video_.textTracks) {
                                    g = b.filterTextTracks_();
                                    for (var m = $jscomp.makeIterator(g), q = m.next(); !q.done; q = m.next()) h = q.value,
                                        "disabled" != h.mode && (h.mode = f ? "showing" : "hidden")
                                }
                                d.jumpTo(2);
                                break
                            }
                            b.mediaSourceEngine_.getTextDisplayer().setTextVisibility(f);
                            if (b.config_.streaming.alwaysStreamText) {
                                d.jumpTo(2);
                                break
                            }
                            if (!f) {
                                b.streamingEngine_.unloadTextStream();
                                d.jumpTo(2);
                                break
                            }
                            if (b.streamingEngine_.getBufferingText()) {
                                d.jumpTo(2);
                                break
                            }
                            k = b.getPresentationPeriod_();
                            l = shaka.util.StreamUtils.filterStreamsByLanguageAndRole(k.textStreams, b.currentTextLanguage_, b.currentTextRole_);
                            if (!(0 < l.length)) {
                                d.jumpTo(2);
                                break
                            }
                            return d.yield(b.streamingEngine_.loadNewTextStream(l[0]),
                                2);
                        case 2:
                            b.onTextTrackVisibility_(), d.jumpToEnd()
                    }
                })
            })
        };
        goog.exportProperty(shaka.Player.prototype, "setTextTrackVisibility", shaka.Player.prototype.setTextTrackVisibility);
        shaka.Player.prototype.getPlayheadTimeAsDate = function() {
            if (!this.isLive()) return shaka.log.warning("getPlayheadTimeAsDate is for live streams!"), null;
            var a = this.walker_.getCurrentPayload(),
                b = 0;
            if (this.playhead_) b = this.playhead_.getTime();
            else if (a) {
                if (null == a.startTime) return new Date;
                b = a.startTime
            }
            if (this.manifest_) return b = this.manifest_.presentationTimeline.getPresentationStartTime(), new Date(1E3 * (b + this.video_.currentTime));
            if (this.video_ && this.video_.getStartDate) return a = this.video_.getStartDate(),
                isNaN(a.getTime()) ? (shaka.log.warning("EXT-X-PROGRAM-DATETIME required to get playhead time as Date!"), null) : new Date(a.getTime() + 1E3 * b);
            shaka.log.warning("No way to get playhead time as Date!");
            return null
        };
        goog.exportProperty(shaka.Player.prototype, "getPlayheadTimeAsDate", shaka.Player.prototype.getPlayheadTimeAsDate);
        shaka.Player.prototype.getPresentationStartTimeAsDate = function() {
            if (!this.isLive()) return shaka.log.warning("getPresentationStartTimeAsDate is for live streams!"), null;
            if (this.manifest_) {
                var a = this.manifest_.presentationTimeline.getPresentationStartTime();
                return new Date(1E3 * a)
            }
            if (this.video_ && this.video_.getStartDate) return a = this.video_.getStartDate(), isNaN(a.getTime()) ? (shaka.log.warning("EXT-X-PROGRAM-DATETIME required to get presentation start time as Date!"), null) : a;
            shaka.log.warning("No way to get presentation start time as Date!");
            return null
        };
        goog.exportProperty(shaka.Player.prototype, "getPresentationStartTimeAsDate", shaka.Player.prototype.getPresentationStartTimeAsDate);
        shaka.Player.prototype.getBufferedInfo = function() {
            var a = {
                total: [],
                audio: [],
                video: [],
                text: []
            };
            this.loadMode_ == shaka.Player.LoadMode.SRC_EQUALS && (a.total = shaka.media.TimeRangesUtils.getBufferedInfo(this.video_.buffered));
            this.loadMode_ == shaka.Player.LoadMode.MEDIA_SOURCE && this.mediaSourceEngine_.getBufferedInfo(a);
            return a
        };
        goog.exportProperty(shaka.Player.prototype, "getBufferedInfo", shaka.Player.prototype.getBufferedInfo);
        shaka.Player.prototype.getStats = function() {
            if (this.loadMode_ != shaka.Player.LoadMode.MEDIA_SOURCE && this.loadMode_ != shaka.Player.LoadMode.SRC_EQUALS) return shaka.util.Stats.getEmptyBlob();
            this.updateStateHistory_();
            goog.asserts.assert(this.video_, "If we have stats, we should have video_");
            var a = this.video_;
            a.getVideoPlaybackQuality && (a = a.getVideoPlaybackQuality(), this.stats_.setDroppedFrames(Number(a.droppedVideoFrames), Number(a.totalVideoFrames)), this.stats_.setCorruptedFrames(Number(a.corruptedVideoFrames)));
            a = this.drmEngine_ ? this.drmEngine_.getLicenseTime() : NaN;
            this.stats_.setLicenseTime(a);
            this.loadMode_ == shaka.Player.LoadMode.MEDIA_SOURCE && ((a = this.getPresentationVariant_()) && this.stats_.setVariantBandwidth(a.bandwidth), a && a.video && this.stats_.setResolution(a.video.width || NaN, a.video.height || NaN), a = this.abrManager_.getBandwidthEstimate(), this.stats_.setBandwidthEstimate(a));
            return this.stats_.getBlob()
        };
        goog.exportProperty(shaka.Player.prototype, "getStats", shaka.Player.prototype.getStats);
        shaka.Player.prototype.addTextTrack = function(a, b, c, d, e, f) {
            var g = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function k() {
                var l, m, n, q, p, t, r, v, u;
                return $jscomp.generator.createGenerator(k, function(k) {
                    switch (k.nextAddress) {
                        case 1:
                            if (g.loadMode_ == shaka.Player.LoadMode.SRC_EQUALS) throw shaka.log.error("Cannot add text when loaded with src="), Error("State error!");
                            if (g.loadMode_ != shaka.Player.LoadMode.MEDIA_SOURCE) throw shaka.log.error("Must call load() and wait for it to resolve before adding text tracks."),
                                Error("State error!");
                            l = g.getPresentationPeriod_();
                            m = shaka.util.ManifestParserUtils.ContentType;
                            n = g.manifest_.periods.indexOf(l);
                            q = n + 1;
                            p = q >= g.manifest_.periods.length ? g.manifest_.presentationTimeline.getDuration() : g.manifest_.periods[q].startTime;
                            t = p - l.startTime;
                            if (Infinity == t) throw new shaka.util.Error(shaka.util.Error.Severity.RECOVERABLE, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.CANNOT_ADD_EXTERNAL_TEXT_TO_LIVE_STREAM);
                            r = new shaka.media.SegmentReference(1, 0, t, function() {
                                    return [a]
                                },
                                0, null);
                            v = {
                                id: g.nextExternalStreamId_++,
                                originalId: null,
                                createSegmentIndex: Promise.resolve.bind(Promise),
                                findSegmentPosition: function(a) {
                                    return 1
                                },
                                getSegmentReference: function(a) {
                                    return 1 == a ? r : null
                                },
                                initSegmentReference: null,
                                presentationTimeOffset: 0,
                                mimeType: d,
                                codecs: e || "",
                                kind: c,
                                encrypted: !1,
                                keyId: null,
                                language: b,
                                label: f || null,
                                type: m.TEXT,
                                primary: !1,
                                frameRate: void 0,
                                pixelAspectRatio: void 0,
                                trickModeVideo: null,
                                emsgSchemeIdUris: null,
                                roles: [],
                                channelsCount: null,
                                audioSamplingRate: null,
                                closedCaptions: null
                            };
                            g.loadingTextStreams_.add(v);
                            l.textStreams.push(v);
                            return k.yield(g.streamingEngine_.loadNewTextStream(v), 2);
                        case 2:
                            return goog.asserts.assert(l, "The period should still be non-null here."), (u = g.streamingEngine_.getBufferingText()) && g.activeStreams_.useText(l, u), g.loadingTextStreams_["delete"](v), shaka.log.debug("Choosing new streams after adding a text stream"), g.chooseStreamsAndSwitch_(l), g.onTracksChanged_(), k["return"](shaka.util.StreamUtils.textStreamToTrack(v))
                    }
                })
            })
        };
        goog.exportProperty(shaka.Player.prototype, "addTextTrack", shaka.Player.prototype.addTextTrack);
        shaka.Player.prototype.setMaxHardwareResolution = function(a, b) {
            this.maxHwRes_.width = a;
            this.maxHwRes_.height = b
        };
        goog.exportProperty(shaka.Player.prototype, "setMaxHardwareResolution", shaka.Player.prototype.setMaxHardwareResolution);
        shaka.Player.prototype.retryStreaming = function() {
            return this.loadMode_ == shaka.Player.LoadMode.MEDIA_SOURCE ? this.streamingEngine_.retry() : !1
        };
        goog.exportProperty(shaka.Player.prototype, "retryStreaming", shaka.Player.prototype.retryStreaming);
        shaka.Player.prototype.getManifest = function() {
            return this.manifest_
        };
        goog.exportProperty(shaka.Player.prototype, "getManifest", shaka.Player.prototype.getManifest);
        shaka.Player.prototype.getManifestParserFactory = function() {
            return this.parser_ ? this.parser_.constructor : null
        };
        goog.exportProperty(shaka.Player.prototype, "getManifestParserFactory", shaka.Player.prototype.getManifestParserFactory);
        shaka.Player.prototype.addVariantToSwitchHistory_ = function(a, b, c) {
            this.activeStreams_.useVariant(a, b);
            this.stats_.getSwitchHistory().updateCurrentVariant(b, c)
        };
        shaka.Player.prototype.addTextStreamToSwitchHistory_ = function(a, b, c) {
            this.activeStreams_.useText(a, b);
            this.stats_.getSwitchHistory().updateCurrentText(b, c)
        };
        shaka.Player.prototype.defaultConfig_ = function() {
            var a = this,
                b = shaka.util.PlayerConfiguration.createDefault();
            b.streaming.failureCallback = function(b) {
                a.defaultStreamingFailureCallback_(b)
            };
            var c = this;
            b.textDisplayFactory = function() {
                return new shaka.text.SimpleTextDisplayer(c.video_)
            };
            return b
        };
        shaka.Player.prototype.defaultStreamingFailureCallback_ = function(a) {
            var b = [shaka.util.Error.Code.BAD_HTTP_STATUS, shaka.util.Error.Code.HTTP_ERROR, shaka.util.Error.Code.TIMEOUT];
            this.isLive() && b.includes(a.code) && (a.severity = shaka.util.Error.Severity.RECOVERABLE, shaka.log.warning("Live streaming error.  Retrying automatically..."), this.retryStreaming())
        };
        shaka.Player.prototype.createTextStreamsForClosedCaptions_ = function(a) {
            for (var b = shaka.util.ManifestParserUtils.ContentType, c = 0; c < a.length; c++) {
                for (var d = a[c], e = new Map, f = $jscomp.makeIterator(d.variants), g = f.next(); !g.done; g = f.next())
                    if (g = g.value, g.video && g.video.closedCaptions) {
                        g = g.video;
                        for (var h = $jscomp.makeIterator(g.closedCaptions.keys()), k = h.next(); !k.done; k = h.next())
                            if (k = k.value, !e.has(k)) {
                                var l = {
                                    id: this.nextExternalStreamId_++,
                                    originalId: k,
                                    createSegmentIndex: Promise.resolve.bind(Promise),
                                    findSegmentPosition: function(a) {
                                        return null
                                    },
                                    getSegmentReference: function(a) {
                                        return null
                                    },
                                    initSegmentReference: null,
                                    presentationTimeOffset: 0,
                                    mimeType: shaka.util.MimeUtils.CLOSED_CAPTION_MIMETYPE,
                                    codecs: "",
                                    kind: shaka.util.ManifestParserUtils.TextStreamKind.CLOSED_CAPTION,
                                    encrypted: !1,
                                    keyId: null,
                                    language: g.closedCaptions.get(k),
                                    label: null,
                                    type: b.TEXT,
                                    primary: !1,
                                    frameRate: void 0,
                                    pixelAspectRatio: void 0,
                                    trickModeVideo: null,
                                    emsgSchemeIdUris: null,
                                    roles: g.roles,
                                    channelsCount: null,
                                    audioSamplingRate: null,
                                    closedCaptions: null
                                };
                                e.set(k, l)
                            }
                    } e = $jscomp.makeIterator(e.values());
                for (f = e.next(); !f.done; f = e.next()) d.textStreams.push(f.value)
            }
        };
        shaka.Player.prototype.filterAllPeriods_ = function(a) {
            goog.asserts.assert(this.video_, "Must not be destroyed");
            var b = shaka.util.ArrayUtils,
                c = shaka.util.StreamUtils,
                d = this.streamingEngine_ ? this.streamingEngine_.getBufferingAudio() : null,
                e = this.streamingEngine_ ? this.streamingEngine_.getBufferingVideo() : null;
            d = c.filterNewPeriod.bind(null, this.drmEngine_, d, e);
            a.forEach(d);
            b = b.count(a, function(a) {
                return a.variants.some(c.isPlayable)
            });
            if (0 == b) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.CONTENT_UNSUPPORTED_BY_BROWSER);
            if (b < a.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.UNPLAYABLE_PERIOD);
            a.forEach(function(a) {
                if (shaka.util.StreamUtils.applyRestrictions(a.variants, this.config_.restrictions, this.maxHwRes_) && this.streamingEngine_ && this.getPresentationPeriod_() == a) this.onTracksChanged_();
                this.checkRestrictedVariants_(a.variants)
            }.bind(this))
        };
        shaka.Player.prototype.filterNewPeriod_ = function(a) {
            goog.asserts.assert(this.video_, "Must not be destroyed");
            var b = shaka.util.StreamUtils,
                c = this.streamingEngine_ ? this.streamingEngine_.getBufferingAudio() : null,
                d = this.streamingEngine_ ? this.streamingEngine_.getBufferingVideo() : null;
            b.filterNewPeriod(this.drmEngine_, c, d, a);
            c = a.variants;
            if (!c.some(b.isPlayable)) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.UNPLAYABLE_PERIOD);
            this.checkRestrictedVariants_(a.variants);
            if (shaka.util.StreamUtils.applyRestrictions(c, this.config_.restrictions, this.maxHwRes_) && this.streamingEngine_ && this.getPresentationPeriod_() == a) this.onTracksChanged_();
            if (a = this.drmEngine_ ? this.drmEngine_.getDrmInfo() : null)
                for (b = $jscomp.makeIterator(c), c = b.next(); !c.done; c = b.next())
                    for (c = $jscomp.makeIterator(c.value.drmInfos), d = c.next(); !d.done; d = c.next())
                        if (d = d.value, d.keySystem == a.keySystem) {
                            d = $jscomp.makeIterator(d.initData || []);
                            for (var e = d.next(); !e.done; e = d.next()) e = e.value, this.drmEngine_.newInitData(e.initDataType,
                                e.initData)
                        }
        };
        shaka.Player.prototype.switchVariant_ = function(a, b, c) {
            b = void 0 === b ? !1 : b;
            c = void 0 === c ? 0 : c;
            if (this.switchingPeriods_) return this.deferredVariant_ = a, this.deferredVariantClearBuffer_ = b, this.deferredVariantClearBufferSafeMargin_ = c, !0;
            if (a = this.streamingEngine_.switchVariant(a, b, c)) this.onVariantChanged_();
            return a
        };
        shaka.Player.prototype.switchTextStream_ = function(a) {
            if (this.switchingPeriods_) return this.deferredTextStream_ = a, !0;
            if (a = this.streamingEngine_.switchTextStream(a)) this.onTextChanged_();
            return a
        };
        shaka.Player.prototype.assertCorrectActiveStreams_ = function() {
            if (this.streamingEngine_ && this.manifest_ && goog.DEBUG) {
                var a = this.streamingEngine_.getBufferingPeriod(),
                    b = this.getPresentationPeriod_();
                if (null != a && a == b) {
                    a = this.streamingEngine_.getBufferingAudio();
                    var c = this.streamingEngine_.getBufferingVideo(),
                        d = this.streamingEngine_.getBufferingText();
                    a = this.deferredVariant_ ? this.deferredVariant_.audio : a;
                    c = this.deferredVariant_ ? this.deferredVariant_.video : c;
                    d = this.deferredTextStream_ || d;
                    var e = this.activeStreams_.getVariant(b);
                    b = this.activeStreams_.getText(b);
                    goog.asserts.assert(e.audio == a, "Inconsistent active audio stream");
                    goog.asserts.assert(e.video == c, "Inconsistent active video stream");
                    goog.asserts.assert(null == d || b == d, "Inconsistent active text stream")
                }
            }
        };
        shaka.Player.prototype.adjustStartTime_ = function(a) {
            function b(a, b) {
                if (!a) return null;
                var c = a.findSegmentPosition(b - e.startTime);
                if (null == c) return null;
                c = a.getSegmentReference(c);
                if (!c) return null;
                c = c.startTime + e.startTime;
                goog.asserts.assert(c <= b, "Segment should start before time");
                return c
            }
            var c = this.streamingEngine_.getBufferingAudio(),
                d = this.streamingEngine_.getBufferingVideo(),
                e = this.getPresentationPeriod_();
            c = b(c, a);
            d = b(d, a);
            return null != d && null != c ? Math.max(d, c) : null != d ? d : null != c ? c : a
        };
        shaka.Player.prototype.updateBufferState_ = function() {
            var a = this.isBuffering();
            this.stats_ && this.bufferObserver_ && this.playhead_ && (this.playRateController_.setBuffering(a), this.updateStateHistory_());
            a = new shaka.util.FakeEvent("buffering", {
                buffering: a
            });
            this.dispatchEvent(a)
        };
        shaka.Player.prototype.onChangePeriod_ = function() {
            this.onTracksChanged_()
        };
        shaka.Player.prototype.onRateChange_ = function() {
            var a = this.video_.playbackRate;
            0 != a && this.playRateController_.set(a)
        };
        shaka.Player.prototype.updateStateHistory_ = function() {
            if (this.stats_ && this.bufferObserver_) {
                var a = shaka.media.BufferingObserver.State,
                    b = this.stats_.getStateHistory();
                this.bufferObserver_.getState() == a.STARVING ? b.update("buffering") : this.video_.paused ? b.update("paused") : this.video_.ended ? b.update("ended") : b.update("playing")
            }
        };
        shaka.Player.prototype.onSeek_ = function() {
            this.playheadObservers_ && this.playheadObservers_.notifyOfSeek();
            this.streamingEngine_ && this.streamingEngine_.seeked();
            this.bufferObserver_ && this.pollBufferState_()
        };
        shaka.Player.prototype.chooseVariant_ = function(a) {
            goog.asserts.assert(this.config_, "Must not be destroyed");
            try {
                this.checkRestrictedVariants_(a)
            } catch (b) {
                return this.onError_(b), null
            }
            goog.asserts.assert(a.length, "Should have thrown for no Variants.");
            a = a.filter(function(a) {
                return shaka.util.StreamUtils.isPlayable(a)
            });
            a = this.currentAdaptationSetCriteria_.create(a);
            this.abrManager_.setVariants(Array.from(a.values()));
            return this.abrManager_.chooseVariant()
        };
        shaka.Player.prototype.chooseTextStream_ = function(a) {
            return shaka.util.StreamUtils.filterStreamsByLanguageAndRole(a, this.currentTextLanguage_, this.currentTextRole_)[0] || null
        };
        shaka.Player.prototype.chooseStreamsAndSwitch_ = function(a) {
            var b = this.chooseVariantAndSwitch_(a, !1);
            a = this.chooseTextAndSwitch_(a);
            if (b || a) this.onAdaptation_()
        };
        shaka.Player.prototype.chooseVariantAndSwitch_ = function(a, b) {
            b = void 0 === b ? !0 : b;
            goog.asserts.assert(this.config_, "Must not be destroyed");
            var c = this.chooseVariant_(a.variants),
                d = !1;
            c && (this.addVariantToSwitchHistory_(a, c, !0), d = this.switchVariant_(c, !0));
            if (b && d) this.onAdaptation_();
            return d
        };
        shaka.Player.prototype.chooseTextAndSwitch_ = function(a) {
            goog.asserts.assert(this.config_, "Must not be destroyed");
            var b = this.chooseTextStream_(a.textStreams),
                c = !1;
            b && this.shouldStreamText_() && (this.addTextStreamToSwitchHistory_(a, b, !0), c = this.switchTextStream_(b));
            return c
        };
        shaka.Player.prototype.onChooseStreams_ = function(a) {
            shaka.log.debug("onChooseStreams_", a);
            goog.asserts.assert(this.config_, "Must not be destroyed");
            try {
                shaka.log.v2("onChooseStreams_, choosing variant from ", a.variants);
                shaka.log.v2("onChooseStreams_, choosing text from ", a.textStreams);
                var b = this.chooseStreams_(a);
                shaka.log.v2("onChooseStreams_, chose variant ", b.variant);
                shaka.log.v2("onChooseStreams_, chose text ", b.text);
                return b
            } catch (c) {
                return this.onError_(c), {
                    variant: null,
                    text: null
                }
            }
        };
        shaka.Player.prototype.chooseStreams_ = function(a) {
            this.switchingPeriods_ = !0;
            this.abrManager_.disable();
            this.onAbrStatusChanged_();
            shaka.log.debug("Choosing new streams after period changed");
            var b = this.chooseVariant_(a.variants),
                c = this.chooseTextStream_(a.textStreams);
            this.deferredVariant_ && (a.variants.includes(this.deferredVariant_) && (b = this.deferredVariant_), this.deferredVariant_ = null);
            this.deferredTextStream_ && (a.textStreams.includes(this.deferredTextStream_) && (c = this.deferredTextStream_), this.deferredTextStream_ =
                null);
            b && this.addVariantToSwitchHistory_(a, b, !0);
            c && this.addTextStreamToSwitchHistory_(a, c, !0);
            a = !this.streamingEngine_.getBufferingPeriod();
            var d = b ? b.audio : null;
            a && c && (d && this.shouldShowText_(d, c) && (this.isTextVisible_ = !0), this.isTextVisible_ && (this.mediaSourceEngine_.getTextDisplayer().setTextVisibility(!0), goog.asserts.assert(this.shouldStreamText_(), "Should be streaming text")), this.onTextTrackVisibility_());
            return this.shouldStreamText_() ? {
                variant: b,
                text: c
            } : {
                variant: b,
                text: null
            }
        };
        shaka.Player.prototype.shouldShowText_ = function(a, b) {
            var c = shaka.util.LanguageUtils,
                d = c.normalize(this.config_.preferredTextLanguage),
                e = c.normalize(a.language),
                f = c.normalize(b.language);
            return c.areLanguageCompatible(f, d) && !c.areLanguageCompatible(e, f)
        };
        shaka.Player.prototype.canSwitch_ = function() {
            shaka.log.debug("canSwitch_");
            goog.asserts.assert(this.config_, "Must not be destroyed");
            this.switchingPeriods_ = !1;
            this.config_.abr.enabled && (this.abrManager_.enable(), this.onAbrStatusChanged_());
            this.deferredVariant_ && (this.streamingEngine_.switchVariant(this.deferredVariant_, this.deferredVariantClearBuffer_, this.deferredVariantClearBufferSafeMargin_), this.onVariantChanged_(), this.deferredVariant_ = null);
            this.deferredTextStream_ && (this.streamingEngine_.switchTextStream(this.deferredTextStream_),
                this.onTextChanged_(), this.deferredTextStream_ = null)
        };
        shaka.Player.prototype.onManifestUpdate_ = function() {
            this.parser_ && this.parser_.update && this.parser_.update()
        };
        shaka.Player.prototype.onSegmentAppended_ = function() {
            this.playhead_ && this.playhead_.notifyOfBufferingChange()
        };
        shaka.Player.prototype.switch_ = function(a, b, c) {
            b = void 0 === b ? !1 : b;
            c = void 0 === c ? 0 : c;
            shaka.log.debug("switch_");
            goog.asserts.assert(this.config_.abr.enabled, "AbrManager should not call switch while disabled!");
            goog.asserts.assert(!this.switchingPeriods_, "AbrManager should not call switch while transitioning between Periods!");
            goog.asserts.assert(this.manifest_, "We need a manifest to switch variants.");
            var d = this.findPeriodWithVariant_(a);
            goog.asserts.assert(d, "A period should contain the variant.");
            this.addVariantToSwitchHistory_(d, a, !0);
            if (this.streamingEngine_ && this.streamingEngine_.switchVariant(a, b, c)) this.onAdaptation_()
        };
        shaka.Player.prototype.onAdaptation_ = function() {
            this.delayDispatchEvent_(new shaka.util.FakeEvent("adaptation"))
        };
        shaka.Player.prototype.onTracksChanged_ = function() {
            this.delayDispatchEvent_(new shaka.util.FakeEvent("trackschanged"))
        };
        shaka.Player.prototype.onVariantChanged_ = function() {
            this.delayDispatchEvent_(new shaka.util.FakeEvent("variantchanged"))
        };
        shaka.Player.prototype.onTextChanged_ = function() {
            this.delayDispatchEvent_(new shaka.util.FakeEvent("textchanged"))
        };
        shaka.Player.prototype.onTextTrackVisibility_ = function() {
            this.delayDispatchEvent_(new shaka.util.FakeEvent("texttrackvisibility"))
        };
        shaka.Player.prototype.onAbrStatusChanged_ = function() {
            this.delayDispatchEvent_(new shaka.util.FakeEvent("abrstatuschanged", {
                newStatus: this.config_.abr.enabled
            }))
        };
        shaka.Player.prototype.onError_ = function(a) {
            goog.asserts.assert(a instanceof shaka.util.Error, "Wrong error type!");
            if (this.loadMode_ != shaka.Player.LoadMode.DESTROYED) {
                var b = new shaka.util.FakeEvent("error", {
                    detail: a
                });
                this.dispatchEvent(b);
                b.defaultPrevented && (a.handled = !0)
            }
        };
        shaka.Player.prototype.onRegionEvent_ = function(a, b) {
            this.dispatchEvent(new shaka.util.FakeEvent(a, {
                detail: {
                    schemeIdUri: b.schemeIdUri,
                    value: b.value,
                    startTime: b.startTime,
                    endTime: b.endTime,
                    id: b.id,
                    eventElement: b.eventElement
                }
            }))
        };
        shaka.Player.prototype.videoErrorToShakaError_ = function() {
            goog.asserts.assert(this.video_.error, "Video error expected, but missing!");
            if (!this.video_.error) return null;
            var a = this.video_.error.code;
            if (1 == a) return null;
            var b = this.video_.error.msExtendedCode;
            b && (0 > b && (b += Math.pow(2, 32)), b = b.toString(16));
            return new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MEDIA, shaka.util.Error.Code.VIDEO_ERROR, a, b, this.video_.error.message)
        };
        shaka.Player.prototype.onVideoError_ = function(a) {
            if (a = this.videoErrorToShakaError_()) this.onError_(a)
        };
        shaka.Player.prototype.onKeyStatus_ = function(a) {
            if (this.streamingEngine_) {
                var b = shaka.Player.restrictedStatuses_,
                    c = this.getPresentationPeriod_(),
                    d = !1,
                    e = Object.keys(a);
                0 == e.length && shaka.log.warning("Got a key status event without any key statuses, so we don't know the real key statuses. If we don't have all the keys, you'll need to set restrictions so we don't select those tracks.");
                var f = 1 == e.length && "00" == e[0];
                f && shaka.log.warning("Got a synthetic key status event, so we don't know the real key statuses. If we don't have all the keys, you'll need to set restrictions so we don't select those tracks.");
                e.length && this.manifest_.periods.forEach(function(c) {
                    c.variants.forEach(function(c) {
                        shaka.util.StreamUtils.getVariantStreams(c).forEach(function(e) {
                            var g = c.allowedByKeySystem;
                            e.keyId && (e = a[f ? "00" : e.keyId], c.allowedByKeySystem = !!e && !b.includes(e));
                            g != c.allowedByKeySystem && (d = !0)
                        })
                    })
                });
                e = this.streamingEngine_.getBufferingAudio();
                var g = this.streamingEngine_.getBufferingVideo();
                (e = shaka.util.StreamUtils.getVariantByStreams(e, g, c.variants)) && !e.allowedByKeySystem && (shaka.log.debug("Choosing new variants after key status changed"),
                    this.chooseVariantAndSwitch_(c));
                d && (this.onTracksChanged_(), this.chooseVariant_(c.variants))
            }
        };
        shaka.Player.prototype.onExpirationUpdated_ = function(a, b) {
            if (this.parser_ && this.parser_.onExpirationUpdated) this.parser_.onExpirationUpdated(a, b);
            var c = new shaka.util.FakeEvent("expirationupdated");
            this.dispatchEvent(c)
        };
        shaka.Player.prototype.shouldStreamText_ = function() {
            return this.config_.streaming.alwaysStreamText || this.isTextTrackVisible()
        };
        shaka.Player.applyPlayRange_ = function(a, b, c) {
            0 < b && (a.isLive() ? shaka.log.warning("|playRangeStart| has been configured for live content. Ignoring the setting.") : a.setUserSeekStart(b));
            b = a.getDuration();
            c < b && (a.isLive() ? shaka.log.warning("|playRangeEnd| has been configured for live content. Ignoring the setting.") : a.setDuration(c))
        };
        shaka.Player.prototype.checkRestrictedVariants_ = function(a) {
            var b = shaka.Player.restrictedStatuses_,
                c = this.drmEngine_ ? this.drmEngine_.getKeyStatuses() : {},
                d = Object.keys(c);
            d = d.length && "00" == d[0];
            var e = !1,
                f = !1,
                g = [],
                h = [];
            a = $jscomp.makeIterator(a);
            for (var k = a.next(); !k.done; k = a.next()) {
                k = k.value;
                var l = [];
                k.audio && l.push(k.audio);
                k.video && l.push(k.video);
                l = $jscomp.makeIterator(l);
                for (var m = l.next(); !m.done; m = l.next())
                    if (m = m.value, m.keyId) {
                        var n = c[d ? "00" : m.keyId];
                        n ? b.includes(n) && (h.includes(n) || h.push(n)) :
                            g.includes(m.keyId) || g.push(m.keyId)
                    } k.allowedByApplication ? k.allowedByKeySystem && (e = !0) : f = !0
            }
            if (!e) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.RESTRICTIONS_CANNOT_BE_MET, {
                hasAppRestrictions: f,
                missingKeys: g,
                restrictedKeyStatuses: h
            });
        };
        shaka.Player.prototype.delayDispatchEvent_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return d.yield(Promise.resolve(), 2);
                        case 2:
                            b.loadMode_ != shaka.Player.LoadMode.DESTROYED && b.dispatchEvent(a), d.jumpToEnd()
                    }
                })
            })
        };
        shaka.Player.getLanguagesFrom_ = function(a) {
            var b = new Set;
            a = $jscomp.makeIterator(a);
            for (var c = a.next(); !c.done; c = a.next()) c = c.value, c.language ? b.add(shaka.util.LanguageUtils.normalize(c.language)) : b.add("und");
            return b
        };
        shaka.Player.getLanguageAndRolesFrom_ = function(a) {
            var b = new Map;
            a = $jscomp.makeIterator(a);
            for (var c = a.next(); !c.done; c = a.next()) {
                var d = c.value;
                c = "und";
                var e = [];
                d.language && (c = shaka.util.LanguageUtils.normalize(d.language));
                (e = "variant" == d.type ? d.audioRoles : d.roles) && e.length || (e = [""]);
                b.has(c) || b.set(c, new Set);
                d = $jscomp.makeIterator(e);
                for (e = d.next(); !e.done; e = d.next()) e = e.value, b.get(c).add(e)
            }
            var f = [];
            b.forEach(function(a, b) {
                for (var c = $jscomp.makeIterator(a), d = c.next(); !d.done; d = c.next()) f.push({
                    language: b,
                    role: d.value
                })
            });
            return f
        };
        shaka.Player.prototype.getSelectableVariants_ = function() {
            var a = this.getPresentationPeriod_();
            if (null == a) return [];
            this.assertCorrectActiveStreams_();
            return a.variants.filter(function(a) {
                return shaka.util.StreamUtils.isPlayable(a)
            })
        };
        shaka.Player.prototype.getSelectableText_ = function() {
            var a = this,
                b = this.getPresentationPeriod_();
            if (null == b) return [];
            this.assertCorrectActiveStreams_();
            return b.textStreams.filter(function(b) {
                return !a.loadingTextStreams_.has(b)
            })
        };
        shaka.Player.prototype.getPresentationPeriod_ = function() {
            goog.asserts.assert(this.manifest_ && this.playhead_, "Only ask for the presentation period when loaded with media source.");
            for (var a = this.playhead_.getTime(), b = null, c = $jscomp.makeIterator(this.manifest_.periods), d = c.next(); !d.done; d = c.next()) d = d.value, d.startTime <= a && (b = d);
            goog.asserts.assert(b, "Should have found a period.");
            return b
        };
        shaka.Player.prototype.getPresentationVariant_ = function() {
            var a = this.getPresentationPeriod_();
            return this.activeStreams_.getVariant(a)
        };
        shaka.Player.prototype.getPresentationText_ = function() {
            var a = this.getPresentationPeriod_();
            if (null == a) return null;
            if (!this.activeStreams_.getText(a)) {
                var b = shaka.util.StreamUtils.filterStreamsByLanguageAndRole(a.textStreams, this.currentTextLanguage_, this.currentTextRole_);
                b.length && this.activeStreams_.useText(a, b[0])
            }
            return this.activeStreams_.getText(a)
        };
        shaka.Player.prototype.isBufferedToEndMS_ = function() {
            goog.asserts.assert(this.video_, "We need a video element to get buffering information");
            goog.asserts.assert(this.mediaSourceEngine_, "We need a media source engine to get buffering information");
            goog.asserts.assert(this.manifest_, "We need a manifest to get buffering information");
            if (this.video_.ended || this.mediaSourceEngine_.ended()) return !0;
            if (this.manifest_.presentationTimeline.isLive()) {
                var a = this.manifest_.presentationTimeline.getSegmentAvailabilityEnd();
                if (shaka.media.TimeRangesUtils.bufferEnd(this.video_.buffered) >= a) return !0
            }
            return !1
        };
        shaka.Player.prototype.isBufferedToEndSrc_ = function() {
            goog.asserts.assert(this.video_, "We need a video element to get buffering information");
            return this.video_.ended ? !0 : shaka.media.TimeRangesUtils.bufferEnd(this.video_.buffered) >= this.video_.duration - 1
        };
        shaka.Player.prototype.findPeriodWithVariant_ = function(a) {
            for (var b = $jscomp.makeIterator(this.manifest_.periods), c = b.next(); !c.done; c = b.next())
                if (c = c.value, c.variants.includes(a)) return c;
            return null
        };
        shaka.Player.prototype.createAbortLoadError_ = function() {
            return new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.PLAYER, shaka.util.Error.Code.LOAD_INTERRUPTED)
        };
        shaka.Player.prototype.getNextStep_ = function(a, b, c, d) {
            var e = null;
            a == this.detachNode_ && (e = c == this.detachNode_ ? this.detachNode_ : this.attachNode_);
            a == this.attachNode_ && (e = this.getNextAfterAttach_(c, b, d));
            a == this.mediaSourceNode_ && (e = this.getNextAfterMediaSource_(c, b, d));
            a == this.parserNode_ && (e = this.getNextMatchingAllDependencies_(this.loadNode_, this.manifestNode_, this.unloadNode_, c, b, d));
            a == this.manifestNode_ && (e = this.getNextMatchingAllDependencies_(this.loadNode_, this.drmNode_, this.unloadNode_, c, b,
                d));
            a == this.drmNode_ && (e = this.getNextMatchingAllDependencies_(this.loadNode_, this.loadNode_, this.unloadNode_, c, b, d));
            a == this.srcEqualsDrmNode_ && (e = c == this.srcEqualsNode_ && b.mediaElement == d.mediaElement ? this.srcEqualsNode_ : this.unloadNode_);
            if (a == this.loadNode_ || a == this.srcEqualsNode_) e = this.unloadNode_;
            a == this.unloadNode_ && (e = this.getNextAfterUnload_(c, b, d));
            goog.asserts.assert(e, "Missing next step!");
            return e
        };
        shaka.Player.prototype.getNextAfterAttach_ = function(a, b, c) {
            return a == this.detachNode_ || b.mediaElement != c.mediaElement ? this.detachNode_ : a == this.attachNode_ ? this.attachNode_ : a == this.mediaSourceNode_ || a == this.loadNode_ ? this.mediaSourceNode_ : a == this.srcEqualsNode_ ? this.srcEqualsDrmNode_ : null
        };
        shaka.Player.prototype.getNextAfterMediaSource_ = function(a, b, c) {
            return a == this.loadNode_ && b.mediaElement == c.mediaElement ? this.parserNode_ : this.unloadNode_
        };
        shaka.Player.prototype.getNextAfterUnload_ = function(a, b, c) {
            return c.mediaElement && b.mediaElement == c.mediaElement ? this.attachNode_ : this.detachNode_
        };
        shaka.Player.prototype.getNextMatchingAllDependencies_ = function(a, b, c, d, e, f) {
            return d == a && e.mediaElement == f.mediaElement && e.uri == f.uri && e.mimeType == f.mimeType && e.factory == f.factory ? b : c
        };
        shaka.Player.prototype.createEmptyPayload_ = function() {
            return {
                factory: null,
                mediaElement: null,
                mimeType: null,
                startTime: null,
                startTimeOfLoad: null,
                uri: null
            }
        };
        shaka.Player.prototype.wrapWalkerListenersWithPromise_ = function(a) {
            var b = this;
            return new Promise(function(c, d) {
                a.onCancel = function() {
                    return d(b.createAbortLoadError_())
                };
                a.onEnd = function() {
                    return c()
                };
                a.onError = function(a) {
                    return d(a)
                };
                a.onSkip = function() {
                    return d(b.createAbortLoadError_())
                }
            })
        };
        shaka.Player.LoadMode = {
            DESTROYED: 0,
            NOT_LOADED: 1,
            MEDIA_SOURCE: 2,
            SRC_EQUALS: 3
        };
        goog.exportProperty(shaka.Player, "LoadMode", shaka.Player.LoadMode);
        shaka.Player.TYPICAL_BUFFERING_THRESHOLD_ = .5;
        shaka.Player.TextTrackLabel = "Shaka Player TextTrack";
        shaka.offline.StoredContentUtils = function() {};
        shaka.offline.StoredContentUtils.fromManifest = function(a, b, c, d) {
            goog.asserts.assert(b.periods.length, "Cannot create stored content from manifest with no periods.");
            var e = void 0 == b.expiration ? Infinity : b.expiration,
                f = b.presentationTimeline.getDuration();
            b = shaka.offline.StoredContentUtils.getTracks_(b.periods[0]);
            return {
                offlineUri: null,
                originalManifestUri: a,
                duration: f,
                size: c,
                expiration: e,
                tracks: b,
                appMetadata: d
            }
        };
        shaka.offline.StoredContentUtils.fromManifestDB = function(a, b) {
            goog.asserts.assert(b.periods.length, "Cannot create stored content from manifestDB with no periods.");
            var c = new shaka.offline.ManifestConverter(a.mechanism(), a.cell()),
                d = b.periods[0],
                e = new shaka.media.PresentationTimeline(null, 0);
            d = c.fromPeriodDB(d, e);
            c = b.appMetadata || {};
            d = shaka.offline.StoredContentUtils.getTracks_(d);
            return {
                offlineUri: a.toString(),
                originalManifestUri: b.originalManifestUri,
                duration: b.duration,
                size: b.size,
                expiration: b.expiration,
                tracks: d,
                appMetadata: c
            }
        };
        shaka.offline.StoredContentUtils.getTracks_ = function(a) {
            var b = shaka.util.StreamUtils,
                c = [],
                d = b.getPlayableVariants(a.variants);
            d = $jscomp.makeIterator(d);
            for (var e = d.next(); !e.done; e = d.next()) c.push(b.variantToTrack(e.value));
            a = $jscomp.makeIterator(a.textStreams);
            for (d = a.next(); !d.done; d = a.next()) c.push(b.textStreamToTrack(d.value));
            return c
        };
        shaka.offline.StreamBandwidthEstimator = function() {
            this.estimateByStreamId_ = {}
        };
        shaka.offline.StreamBandwidthEstimator.prototype.addVariant = function(a) {
            var b = a.audio,
                c = a.video;
            b && !c && this.setBitrate_(b.id, b.bandwidth || a.bandwidth);
            !b && c && this.setBitrate_(c.id, c.bandwidth || a.bandwidth);
            if (b && c) {
                var d = b.bandwidth || shaka.offline.StreamBandwidthEstimator.DEFAULT_AUDIO_BITRATE_,
                    e = c.bandwidth || a.bandwidth - d;
                0 >= e && (shaka.log.warning("Audio bit rate consumes variants bandwidth. Setting video bandwidth to match variant's bandwidth."), e = a.bandwidth);
                this.setBitrate_(b.id, d);
                this.setBitrate_(c.id,
                    e)
            }
        };
        shaka.offline.StreamBandwidthEstimator.prototype.setBitrate_ = function(a, b) {
            this.estimateByStreamId_[a] = b
        };
        shaka.offline.StreamBandwidthEstimator.prototype.addText = function(a) {
            this.estimateByStreamId_[a.id] = shaka.offline.StreamBandwidthEstimator.DEFAULT_TEXT_BITRATE_
        };
        shaka.offline.StreamBandwidthEstimator.prototype.getSegmentEstimate = function(a, b) {
            var c = b.endTime - b.startTime;
            return this.getEstimate_(a) * c
        };
        shaka.offline.StreamBandwidthEstimator.prototype.getInitSegmentEstimate = function(a) {
            return .5 * this.getEstimate_(a)
        };
        shaka.offline.StreamBandwidthEstimator.prototype.getEstimate_ = function(a) {
            a = this.estimateByStreamId_[a];
            null == a && (a = 0, shaka.log.error("Asking for bitrate of stream not given to the estimator"));
            0 == a && shaka.log.warning("Using bitrate of 0, this stream won't affect progress");
            return a
        };
        shaka.offline.StreamBandwidthEstimator.DEFAULT_AUDIO_BITRATE_ = 393216;
        shaka.offline.StreamBandwidthEstimator.DEFAULT_TEXT_BITRATE_ = 52;
        shaka.util.Destroyer = function(a) {
            this.destroyed_ = !1;
            this.waitOnDestroy_ = new shaka.util.PublicPromise;
            this.onDestroy_ = a
        };
        shaka.util.Destroyer.prototype.destroyed = function() {
            return this.destroyed_
        };
        shaka.util.Destroyer.prototype.destroy = function() {
            var a = this;
            if (this.destroyed_) return this.waitOnDestroy_;
            this.destroyed_ = !0;
            return this.onDestroy_().then(function() {
                a.waitOnDestroy_.resolve()
            }, function() {
                a.waitOnDestroy_.resolve()
            })
        };
        shaka.util.ManifestFilter = function() {};
        shaka.util.ManifestFilter.filterByRestrictions = function(a, b, c) {
            a = $jscomp.makeIterator(a.periods);
            for (var d = a.next(); !d.done; d = a.next()) d = d.value, d.variants = d.variants.filter(function(a) {
                return shaka.util.StreamUtils.meetsRestrictions(a, b, c)
            })
        };
        shaka.util.ManifestFilter.filterByMediaSourceSupport = function(a) {
            var b = shaka.media.MediaSourceEngine;
            a = $jscomp.makeIterator(a.periods);
            for (var c = a.next(); !c.done; c = a.next()) c = c.value, c.variants = c.variants.filter(function(a) {
                var c = !0;
                a.audio && (c = c && b.isStreamSupported(a.audio));
                a.video && (c = c && b.isStreamSupported(a.video));
                return c
            })
        };
        shaka.util.ManifestFilter.filterByDrmSupport = function(a, b) {
            for (var c = $jscomp.makeIterator(a.periods), d = c.next(); !d.done; d = c.next()) d = d.value, d.variants = d.variants.filter(function(a) {
                return b.supportsVariant(a)
            })
        };
        shaka.util.ManifestFilter.filterByCommonCodecs = function(a) {
            goog.asserts.assert(0 < a.periods.length, "There should be at least be one period");
            var b = shaka.util.ManifestFilter,
                c = new shaka.util.ManifestFilter.VariantCodecSummarySet;
            a.periods.forEach(function(a, d) {
                var e = b.VariantCodecSummarySet.fromVariants(a.variants);
                if (0 == d) c.includeAll(e);
                else c.onlyKeep(e)
            });
            a = $jscomp.makeIterator(a.periods);
            for (var d = a.next(); !d.done; d = a.next()) d = d.value, d.variants = d.variants.filter(function(a) {
                a = new b.VariantCodecSummary(a);
                return c.contains(a)
            })
        };
        shaka.util.ManifestFilter.rollingFilter = function(a, b) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            e = null, f = $jscomp.makeIterator(a.periods), g = f.next();
                        case 2:
                            if (g.done) {
                                d.jumpTo(0);
                                break
                            }
                            h = g.value;
                            e && (h.variants = h.variants.filter(function(a) {
                                a = new shaka.util.ManifestFilter.VariantCodecSummary(a);
                                return e.contains(a)
                            }));
                            return d.yield(b(h), 5);
                        case 5:
                            e = shaka.util.ManifestFilter.VariantCodecSummarySet.fromVariants(h.variants), g =
                                f.next(), d.jumpTo(2)
                    }
                })
            })
        };
        shaka.util.ManifestFilter.VariantCodecSummary = function(a) {
            var b = a.audio;
            a = a.video;
            this.audioMime_ = b ? b.mimeType : null;
            this.audioCodec_ = b ? b.codecs.split(".")[0] : null;
            this.videoMime_ = a ? a.mimeType : null;
            this.videoCodec_ = a ? a.codecs.split(".")[0] : null
        };
        shaka.util.ManifestFilter.VariantCodecSummary.prototype.equals = function(a) {
            return this.audioMime_ == a.audioMime_ && this.audioCodec_ == a.audioCodec_ && this.videoMime_ == a.videoMime_ && this.videoCodec_ == a.videoCodec_
        };
        shaka.util.ManifestFilter.VariantCodecSummarySet = function() {
            this.all_ = []
        };
        shaka.util.ManifestFilter.VariantCodecSummarySet.prototype.add = function(a) {
            this.contains(a) || this.all_.push(a)
        };
        shaka.util.ManifestFilter.VariantCodecSummarySet.prototype.includeAll = function(a) {
            a = $jscomp.makeIterator(a.all_);
            for (var b = a.next(); !b.done; b = a.next()) this.add(b.value)
        };
        shaka.util.ManifestFilter.VariantCodecSummarySet.prototype.onlyKeep = function(a) {
            this.all_ = this.all_.filter(function(b) {
                return a.contains(b)
            })
        };
        shaka.util.ManifestFilter.VariantCodecSummarySet.prototype.contains = function(a) {
            return this.all_.some(function(b) {
                return a.equals(b)
            })
        };
        shaka.util.ManifestFilter.VariantCodecSummarySet.fromVariants = function(a) {
            var b = new shaka.util.ManifestFilter.VariantCodecSummarySet;
            a = $jscomp.makeIterator(a);
            for (var c = a.next(); !c.done; c = a.next()) b.add(new shaka.util.ManifestFilter.VariantCodecSummary(c.value));
            return b
        };
        shaka.offline.Storage = function(a) {
            var b = this;
            if (a && a.constructor != shaka.Player) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.LOCAL_PLAYER_INSTANCE_REQUIRED);
            this.networkingEngine_ = this.config_ = null;
            a ? (this.config_ = a.getSharedConfiguration(), this.networkingEngine_ = a.getNetworkingEngine(), goog.asserts.assert(this.networkingEngine_, "Storage should not be initialized with a player that had |destroy| called on it.")) : (this.config_ =
                shaka.util.PlayerConfiguration.createDefault(), this.networkingEngine_ = new shaka.net.NetworkingEngine);
            this.storeInProgress_ = !1;
            this.segmentsFromStore_ = [];
            this.openOperations_ = [];
            var c = !a;
            this.destroyer_ = new shaka.util.Destroyer(function() {
                return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                    var a;
                    return $jscomp.generator.createGenerator(e, function(e) {
                        switch (e.nextAddress) {
                            case 1:
                                return a = function() {}, e.yield(Promise.all(b.openOperations_.map(function(b) {
                                    return b.then(a, a)
                                })), 2);
                            case 2:
                                if (!c) {
                                    e.jumpTo(3);
                                    break
                                }
                                return e.yield(b.networkingEngine_.destroy(), 3);
                            case 3:
                                b.config_ = null, b.networkingEngine_ = null, e.jumpToEnd()
                        }
                    })
                })
            })
        };
        goog.exportSymbol("shaka.offline.Storage", shaka.offline.Storage);
        shaka.offline.Storage.support = function() {
            return shaka.util.Platform.supportsMediaSource() ? shaka.offline.StorageMuxer.support() : !1
        };
        goog.exportProperty(shaka.offline.Storage, "support", shaka.offline.Storage.support);
        shaka.offline.Storage.prototype.destroy = function() {
            return this.destroyer_.destroy()
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "destroy", shaka.offline.Storage.prototype.destroy);
        shaka.offline.Storage.prototype.configure = function(a, b) {
            goog.asserts.assert("object" == typeof a || 2 == arguments.length, "String configs should have values!");
            2 == arguments.length && "string" == typeof a && (a = shaka.util.ConfigUtils.convertToConfigObject(a, b));
            goog.asserts.assert("object" == typeof a, "Should be an object!");
            shaka.offline.Storage.verifyConfig_(a);
            goog.asserts.assert(this.config_, "Cannot reconfigure stroage after calling destroy.");
            return shaka.util.PlayerConfiguration.mergeConfigObjects(this.config_,
                a)
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "configure", shaka.offline.Storage.prototype.configure);
        shaka.offline.Storage.prototype.getConfiguration = function() {
            goog.asserts.assert(this.config_, "Config must not be null!");
            var a = shaka.util.PlayerConfiguration.createDefault();
            shaka.util.PlayerConfiguration.mergeConfigObjects(a, this.config_, shaka.util.PlayerConfiguration.createDefault());
            return a
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "getConfiguration", shaka.offline.Storage.prototype.getConfiguration);
        shaka.offline.Storage.prototype.getNetworkingEngine = function() {
            return this.networkingEngine_
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "getNetworkingEngine", shaka.offline.Storage.prototype.getNetworkingEngine);
        shaka.offline.Storage.prototype.store = function(a, b, c) {
            var d = this;
            return this.startOperation_(this.store_(a, b || {}, function() {
                return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                    var b, h;
                    return $jscomp.generator.createGenerator(f, function(f) {
                        switch (f.nextAddress) {
                            case 1:
                                if (c && "string" != typeof c) return shaka.Deprecate.deprecateFeature(2, 6, "Storing with a manifest parser factory", "Please register a manifest parser and for the mime-type."), b = c, f["return"](new b);
                                goog.asserts.assert(d.networkingEngine_,
                                    "Should not call |store| after |destroy|");
                                return f.yield(shaka.media.ManifestParser.create(a, d.networkingEngine_, d.config_.manifest.retryParameters, c), 2);
                            case 2:
                                return h = f.yieldResult, f["return"](h)
                        }
                    })
                })
            }))
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "store", shaka.offline.Storage.prototype.store);
        shaka.offline.Storage.prototype.getStoreInProgress = function() {
            return this.storeInProgress_
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "getStoreInProgress", shaka.offline.Storage.prototype.getStoreInProgress);
        shaka.offline.Storage.prototype.store_ = function(a, b, c) {
            var d = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                var g, h, k, l, m, n, q, p, t, r;
                return $jscomp.generator.createGenerator(f, function(f) {
                    switch (f.nextAddress) {
                        case 1:
                            d.requireSupport_();
                            if (d.storeInProgress_) return f["return"](Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.STORE_ALREADY_IN_PROGRESS)));
                            d.storeInProgress_ = !0;
                            return f.yield(d.parseManifest(a,
                                c), 2);
                        case 2:
                            g = f.yieldResult;
                            d.checkDestroyed_();
                            h = !g.presentationTimeline.isLive() && !g.presentationTimeline.isInProgress();
                            if (!h) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.CANNOT_STORE_LIVE_OFFLINE, a);
                            k = null;
                            l = new shaka.offline.StorageMuxer;
                            n = m = null;
                            f.setCatchFinallyBlocks(3, 4);
                            return f.yield(d.createDrmEngine(g, function(a) {
                                n = n || a
                            }), 6);
                        case 6:
                            k = f.yieldResult;
                            d.checkDestroyed_();
                            if (n) throw n;
                            return f.yield(d.filterManifest_(g,
                                k), 7);
                        case 7:
                            return f.yield(l.init(), 8);
                        case 8:
                            return d.checkDestroyed_(), f.yield(l.getActive(), 9);
                        case 9:
                            return m = f.yieldResult, d.checkDestroyed_(), goog.asserts.assert(k, "drmEngine should be non-null here."), f.yield(d.downloadManifest_(m.cell, k, g, a, b), 10);
                        case 10:
                            q = f.yieldResult;
                            d.checkDestroyed_();
                            if (n) throw n;
                            return f.yield(m.cell.addManifests([q]), 11);
                        case 11:
                            return p = f.yieldResult, d.checkDestroyed_(), t = shaka.offline.OfflineUri.manifest(m.path.mechanism, m.path.cell, p[0]), f["return"](shaka.offline.StoredContentUtils.fromManifestDB(t,
                                q));
                        case 4:
                            return f.enterFinallyBlock(), d.storeInProgress_ = !1, d.segmentsFromStore_ = [], f.yield(l.destroy(), 12);
                        case 12:
                            if (!k) {
                                f.jumpTo(13);
                                break
                            }
                            return f.yield(k.destroy(), 13);
                        case 13:
                            f.leaveFinallyBlock(0);
                            break;
                        case 3:
                            r = f.enterCatchBlock();
                            if (!m) {
                                f.jumpTo(15);
                                break
                            }
                            return f.yield(m.cell.removeSegments(d.segmentsFromStore_, function() {}), 15);
                        case 15:
                            throw n || r;
                    }
                })
            })
        };
        shaka.offline.Storage.prototype.filterManifest_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return f = {
                                    width: Infinity,
                                    height: Infinity
                                }, shaka.util.ManifestFilter.filterByRestrictions(a, c.config_.restrictions, f), shaka.util.ManifestFilter.filterByMediaSourceSupport(a), shaka.util.ManifestFilter.filterByDrmSupport(a, b), shaka.util.ManifestFilter.filterByCommonCodecs(a),
                                g = c.config_.preferredAudioChannelCount, shaka.util.StreamUtils.chooseCodecsAndFilterManifest(a, g), e.yield(shaka.util.ManifestFilter.rollingFilter(a, function(a) {
                                    return $jscomp.asyncExecutePromiseGeneratorFunction(function m() {
                                        var b, e, f, g, h, k, u, y;
                                        return $jscomp.generator.createGenerator(m, function(m) {
                                            switch (m.nextAddress) {
                                                case 1:
                                                    b = shaka.util.StreamUtils;
                                                    e = [];
                                                    for (var n = $jscomp.makeIterator(a.variants), p = n.next(); !p.done; p = n.next()) f = p.value, goog.asserts.assert(b.isPlayable(f), 'We should have already filtered by "is playable"'),
                                                        e.push(b.variantToTrack(f));
                                                    n = $jscomp.makeIterator(a.textStreams);
                                                    for (p = n.next(); !p.done; p = n.next()) g = p.value, e.push(b.textStreamToTrack(g));
                                                    return m.yield(c.config_.offline.trackSelectionCallback(e), 2);
                                                case 2:
                                                    h = m.yieldResult;
                                                    k = new Set;
                                                    u = new Set;
                                                    n = $jscomp.makeIterator(h);
                                                    for (p = n.next(); !p.done; p = n.next()) y = p.value, "variant" == y.type && k.add(y.id), "text" == y.type && u.add(y.id);
                                                    a.variants = a.variants.filter(function(a) {
                                                        return k.has(a.id)
                                                    });
                                                    a.textStreams = a.textStreams.filter(function(a) {
                                                        return u.has(a.id)
                                                    });
                                                    m.jumpToEnd()
                                            }
                                        })
                                    })
                                }), 2);
                        case 2:
                            shaka.offline.Storage.validateManifest_(a), e.jumpToEnd()
                    }
                })
            })
        };
        shaka.offline.Storage.prototype.downloadManifest_ = function(a, b, c, d, e) {
            var f = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function h() {
                var k, l, m, n, q, p, t, r, v, u;
                return $jscomp.generator.createGenerator(h, function(h) {
                    switch (h.nextAddress) {
                        case 1:
                            return goog.asserts.assert(f.networkingEngine_, "Cannot call |downloadManifest_| after calling |destroy|."), k = shaka.offline.StoredContentUtils.fromManifest(d, c, 0, e), l = c.periods.some(function(a) {
                                return a.variants.some(function(a) {
                                    return a.drmInfos &&
                                        a.drmInfos.length
                                })
                            }), m = c.periods.some(function(a) {
                                return a.variants.some(function(a) {
                                    return a.drmInfos.some(function(a) {
                                        return a.initData && a.initData.length
                                    })
                                })
                            }), n = l && !m, q = null, n && (p = b.getDrmInfo(), q = shaka.offline.Storage.defaultSystemIds_.get(p.keySystem)), t = new shaka.offline.DownloadManager(f.networkingEngine_, function(a, b) {
                                k.size = b;
                                f.config_.offline.progressCallback(k, a)
                            }, function(a, c) {
                                n && f.config_.offline.usePersistentLicense && q == c && b.newInitData("cenc", a)
                            }), h.setFinallyBlock(2), v = r = f.createOfflineManifest_(t,
                                a, b, c, d, e), h.yield(t.waitToFinish(), 4);
                        case 4:
                            v.size = h.yieldResult;
                            r.expiration = b.getExpiration();
                            u = b.getSessionIds();
                            r.sessionIds = f.config_.offline.usePersistentLicense ? u : [];
                            if (l && f.config_.offline.usePersistentLicense && !u.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.NO_INIT_DATA_FOR_OFFLINE);
                            return h["return"](r);
                        case 2:
                            return h.enterFinallyBlock(), h.yield(t.destroy(), 5);
                        case 5:
                            h.leaveFinallyBlock(0)
                    }
                })
            })
        };
        shaka.offline.Storage.prototype.remove = function(a) {
            return this.startOperation_(this.remove_(a))
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "remove", shaka.offline.Storage.prototype.remove);
        shaka.offline.Storage.prototype.remove_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            b.requireSupport_();
                            e = shaka.offline.OfflineUri.parse(a);
                            if (null == e || !e.isManifest()) return d["return"](Promise.reject(new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.MALFORMED_OFFLINE_URI, a)));
                            f = e;
                            g = new shaka.offline.StorageMuxer;
                            d.setFinallyBlock(2);
                            return d.yield(g.init(), 4);
                        case 4:
                            return d.yield(g.getCell(f.mechanism(), f.cell()), 5);
                        case 5:
                            return h = d.yieldResult, d.yield(h.getManifests([f.key()]), 6);
                        case 6:
                            return k = d.yieldResult, l = k[0], d.yield(Promise.all([b.removeFromDRM_(f, l, g), b.removeFromStorage_(h, f, l)]), 2);
                        case 2:
                            return d.enterFinallyBlock(), d.yield(g.destroy(), 8);
                        case 8:
                            d.leaveFinallyBlock(0)
                    }
                })
            })
        };
        shaka.offline.Storage.getCapabilities_ = function(a, b) {
            for (var c = shaka.util.MimeUtils, d = [], e = $jscomp.makeIterator(a.periods), f = e.next(); !f.done; f = e.next()) {
                f = $jscomp.makeIterator(f.value.streams);
                for (var g = f.next(); !g.done; g = f.next()) g = g.value, b && "video" == g.contentType ? d.push({
                    contentType: c.getFullType(g.mimeType, g.codecs),
                    robustness: a.drmInfo.videoRobustness
                }) : b || "audio" != g.contentType || d.push({
                    contentType: c.getFullType(g.mimeType, g.codecs),
                    robustness: a.drmInfo.audioRobustness
                })
            }
            return d
        };
        shaka.offline.Storage.prototype.removeFromDRM_ = function(a, b, c) {
            var d = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                return $jscomp.generator.createGenerator(f, function(a) {
                    switch (a.nextAddress) {
                        case 1:
                            return goog.asserts.assert(d.networkingEngine_, "Cannot be destroyed"), a.yield(shaka.offline.Storage.deleteLicenseFor_(d.networkingEngine_, d.config_.drm, c, b), 0)
                    }
                })
            })
        };
        shaka.offline.Storage.prototype.removeFromStorage_ = function(a, b, c) {
            var d = this,
                e = shaka.offline.Storage.getAllSegmentIds_(c),
                f = e.length + 1,
                g = 0,
                h = shaka.offline.StoredContentUtils.fromManifestDB(b, c);
            c = function(a) {
                g += 1;
                d.config_.offline.progressCallback(h, g / f)
            };
            return Promise.all([a.removeSegments(e, c), a.removeManifests([b.key()], c)])
        };
        shaka.offline.Storage.prototype.removeEmeSessions = function() {
            return this.startOperation_(this.removeEmeSessions_())
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "removeEmeSessions", shaka.offline.Storage.prototype.removeEmeSessions);
        shaka.offline.Storage.prototype.removeEmeSessions_ = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e, f, g, h, k, l, m, n, q;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return a.requireSupport_(), goog.asserts.assert(a.networkingEngine_, "Cannot be destroyed"), d = a.networkingEngine_, e = a.config_.drm, f = new shaka.offline.StorageMuxer, g = new shaka.offline.SessionDeleter, h = !1, c.setFinallyBlock(2), c.yield(f.init(), 4);
                        case 4:
                            k = [];
                            f.forEachEmeSessionCell(function(a) {
                                return k.push(a)
                            });
                            l = Promise.resolve();
                            m = {};
                            n = $jscomp.makeIterator(k);
                            for (q = n.next(); !q.done; m = {
                                    sessionIdCell: m.sessionIdCell
                                }, q = n.next()) m.sessionIdCell = q.value, l = l.then(function(a) {
                                return function() {
                                    return $jscomp.asyncExecutePromiseGeneratorFunction(function v() {
                                        var c, f;
                                        return $jscomp.generator.createGenerator(v, function(k) {
                                            switch (k.nextAddress) {
                                                case 1:
                                                    return k.yield(a.sessionIdCell.getAll(), 2);
                                                case 2:
                                                    return c = k.yieldResult, k.yield(g["delete"](e, d, c), 3);
                                                case 3:
                                                    return f = k.yieldResult, k.yield(a.sessionIdCell.remove(f),
                                                        4);
                                                case 4:
                                                    f.length != c.length && (h = !0), k.jumpToEnd()
                                            }
                                        })
                                    })
                                }
                            }(m));
                            return c.yield(l, 2);
                        case 2:
                            return c.enterFinallyBlock(), c.yield(f.destroy(), 6);
                        case 6:
                            c.leaveFinallyBlock(3);
                            break;
                        case 3:
                            return c["return"](!h)
                    }
                })
            })
        };
        shaka.offline.Storage.prototype.list = function() {
            return this.startOperation_(this.list_())
        };
        goog.exportProperty(shaka.offline.Storage.prototype, "list", shaka.offline.Storage.prototype.list);
        shaka.offline.Storage.prototype.list_ = function() {
            var a = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function c() {
                var d, e, f;
                return $jscomp.generator.createGenerator(c, function(c) {
                    switch (c.nextAddress) {
                        case 1:
                            return a.requireSupport_(), d = [], e = new shaka.offline.StorageMuxer, c.setFinallyBlock(2), c.yield(e.init(), 4);
                        case 4:
                            return f = Promise.resolve(), e.forEachCell(function(a, c) {
                                f = f.then(function() {
                                    return $jscomp.asyncExecutePromiseGeneratorFunction(function m() {
                                        var e;
                                        return $jscomp.generator.createGenerator(m,
                                            function(f) {
                                                switch (f.nextAddress) {
                                                    case 1:
                                                        return f.yield(c.getAllManifests(), 2);
                                                    case 2:
                                                        e = f.yieldResult, e.forEach(function(c, e) {
                                                            var f = shaka.offline.OfflineUri.manifest(a.mechanism, a.cell, e);
                                                            f = shaka.offline.StoredContentUtils.fromManifestDB(f, c);
                                                            d.push(f)
                                                        }), f.jumpToEnd()
                                                }
                                            })
                                    })
                                })
                            }), c.yield(f, 2);
                        case 2:
                            return c.enterFinallyBlock(), c.yield(e.destroy(), 6);
                        case 6:
                            c.leaveFinallyBlock(3);
                            break;
                        case 3:
                            return c["return"](d)
                    }
                })
            })
        };
        shaka.offline.Storage.prototype.parseManifest = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l, m;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return f = null, g = c.networkingEngine_, goog.asserts.assert(g, "Should be initialized!"), h = {
                                networkingEngine: g,
                                filterAllPeriods: function() {},
                                filterNewPeriod: function() {},
                                onTimelineRegionAdded: function() {},
                                onEvent: function() {},
                                onError: function(a) {
                                    f = a
                                }
                            }, e.yield(b(), 2);
                        case 2:
                            return k =
                                e.yieldResult, k.configure(c.config_.manifest), c.checkDestroyed_(), e.setFinallyBlock(3), e.yield(k.start(a, h), 5);
                        case 5:
                            return l = e.yieldResult, c.checkDestroyed_(), m = shaka.offline.Storage.getAllStreamsFromManifest_(l), e.yield(Promise.all(shaka.util.Iterables.map(m, function(a) {
                                return a.createSegmentIndex()
                            })), 6);
                        case 6:
                            c.checkDestroyed_();
                            if (f) throw f;
                            return e["return"](l);
                        case 3:
                            return e.enterFinallyBlock(), e.yield(k.stop(), 7);
                        case 7:
                            e.leaveFinallyBlock(0)
                    }
                })
            })
        };
        shaka.offline.Storage.prototype.createDrmEngine = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return goog.asserts.assert(c.networkingEngine_, "Cannot call |createDrmEngine| after |destroy|"), f = new shaka.media.DrmEngine({
                                    netEngine: c.networkingEngine_,
                                    onError: b,
                                    onKeyStatus: function() {},
                                    onExpirationUpdated: function() {},
                                    onEvent: function() {}
                                }), g = shaka.util.Periods.getAllVariantsFrom(a.periods),
                                h = c.config_, f.configure(h.drm), e.yield(f.initForStorage(g, h.offline.usePersistentLicense), 2);
                        case 2:
                            return e.yield(f.setServerCertificate(), 3);
                        case 3:
                            return e.yield(f.createOrLoad(), 4);
                        case 4:
                            return e["return"](f)
                    }
                })
            })
        };
        shaka.offline.Storage.prototype.createOfflineManifest_ = function(a, b, c, d, e, f) {
            var g = this,
                h = new shaka.offline.StreamBandwidthEstimator,
                k = d.periods.map(function(e) {
                    return g.createPeriod_(a, b, h, c, d, e)
                }),
                l = c.getDrmInfo(),
                m = this.config_.offline.usePersistentLicense;
            l && m && (l.initData = []);
            return {
                originalManifestUri: e,
                duration: d.presentationTimeline.getDuration(),
                size: 0,
                expiration: c.getExpiration(),
                periods: k,
                sessionIds: m ? c.getSessionIds() : [],
                drmInfo: l,
                appMetadata: f
            }
        };
        shaka.offline.Storage.prototype.createPeriod_ = function(a, b, c, d, e, f) {
            d = $jscomp.makeIterator(f.variants);
            for (var g = d.next(); !g.done; g = d.next()) c.addVariant(g.value);
            d = $jscomp.makeIterator(f.textStreams);
            for (g = d.next(); !g.done; g = d.next()) c.addText(g.value);
            d = shaka.offline.Storage.getAllStreamsFromPeriod_(f);
            var h = new Map;
            d = $jscomp.makeIterator(d);
            for (g = d.next(); !g.done; g = d.next()) {
                g = g.value;
                var k = this.createStream_(a, b, c, e, f, g);
                h.set(g.id, k)
            }
            f.variants.forEach(function(a) {
                a.audio && h.get(a.audio.id).variantIds.push(a.id);
                a.video && h.get(a.video.id).variantIds.push(a.id)
            });
            return {
                startTime: f.startTime,
                streams: Array.from(h.values())
            }
        };
        shaka.offline.Storage.prototype.createStream_ = function(a, b, c, d, e, f) {
            var g = this,
                h = {
                    id: f.id,
                    originalId: f.originalId,
                    primary: f.primary,
                    presentationTimeOffset: f.presentationTimeOffset || 0,
                    contentType: f.type,
                    mimeType: f.mimeType,
                    codecs: f.codecs,
                    frameRate: f.frameRate,
                    pixelAspectRatio: f.pixelAspectRatio,
                    kind: f.kind,
                    language: f.language,
                    label: f.label,
                    width: f.width || null,
                    height: f.height || null,
                    initSegmentKey: null,
                    encrypted: f.encrypted,
                    keyId: f.keyId,
                    segments: [],
                    variantIds: []
                };
            d = d.presentationTimeline.getSegmentAvailabilityStart();
            var k = f.id;
            if (e = f.initSegmentReference) e = shaka.util.Networking.createSegmentRequest(e.getUris(), e.startByte, e.endByte, this.config_.streaming.retryParameters), a.queue(k, e, c.getInitSegmentEstimate(f.id), !0, function(a) {
                return $jscomp.asyncExecutePromiseGeneratorFunction(function n() {
                    var c;
                    return $jscomp.generator.createGenerator(n, function(d) {
                        switch (d.nextAddress) {
                            case 1:
                                return d.yield(b.addSegments([{
                                    data: a
                                }]), 2);
                            case 2:
                                c = d.yieldResult, g.segmentsFromStore_.push(c[0]), h.initSegmentKey = c[0], d.jumpToEnd()
                        }
                    })
                })
            });
            shaka.offline.Storage.forEachSegment_(f, d, function(d) {
                var e = shaka.util.Networking.createSegmentRequest(d.getUris(), d.startByte, d.endByte, g.config_.streaming.retryParameters);
                a.queue(k, e, c.getSegmentEstimate(f.id, d), !1, function(a) {
                    return $jscomp.asyncExecutePromiseGeneratorFunction(function p() {
                        var c;
                        return $jscomp.generator.createGenerator(p, function(e) {
                            switch (e.nextAddress) {
                                case 1:
                                    return e.yield(b.addSegments([{
                                        data: a
                                    }]), 2);
                                case 2:
                                    c = e.yieldResult, g.segmentsFromStore_.push(c[0]), h.segments.push({
                                        startTime: d.startTime,
                                        endTime: d.endTime,
                                        dataKey: c[0]
                                    }), e.jumpToEnd()
                            }
                        })
                    })
                })
            });
            return h
        };
        shaka.offline.Storage.forEachSegment_ = function(a, b, c) {
            b = a.findSegmentPosition(b);
            for (var d = null == b ? null : a.getSegmentReference(b); d;) c(d), d = a.getSegmentReference(++b)
        };
        shaka.offline.Storage.prototype.checkDestroyed_ = function() {
            if (this.destroyer_.destroyed()) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.OPERATION_ABORTED);
        };
        shaka.offline.Storage.prototype.requireSupport_ = function() {
            if (!shaka.offline.Storage.support()) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.STORAGE, shaka.util.Error.Code.STORAGE_NOT_SUPPORTED);
        };
        shaka.offline.Storage.prototype.startOperation_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return b.openOperations_.push(a), d.setFinallyBlock(2), d.yield(a, 4);
                        case 4:
                            return d["return"](d.yieldResult);
                        case 2:
                            d.enterFinallyBlock(), shaka.util.ArrayUtils.remove(b.openOperations_, a), d.leaveFinallyBlock(0)
                    }
                })
            })
        };
        shaka.offline.Storage.getAllSegmentIds_ = function(a) {
            var b = [];
            a.periods.forEach(function(a) {
                a.streams.forEach(function(a) {
                    null != a.initSegmentKey && b.push(a.initSegmentKey);
                    a.segments.forEach(function(a) {
                        b.push(a.dataKey)
                    })
                })
            });
            return b
        };
        shaka.offline.Storage.deleteAll = function() {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function b() {
                var c;
                return $jscomp.generator.createGenerator(b, function(b) {
                    switch (b.nextAddress) {
                        case 1:
                            return c = new shaka.offline.StorageMuxer, b.setFinallyBlock(2), b.yield(c.erase(), 2);
                        case 2:
                            return b.enterFinallyBlock(), b.yield(c.destroy(), 5);
                        case 5:
                            b.leaveFinallyBlock(0)
                    }
                })
            })
        };
        goog.exportProperty(shaka.offline.Storage, "deleteAll", shaka.offline.Storage.deleteAll);
        shaka.offline.Storage.deleteLicenseFor_ = function(a, b, c, d) {
            return $jscomp.asyncExecutePromiseGeneratorFunction(function f() {
                var g, h, k, l;
                return $jscomp.generator.createGenerator(f, function(f) {
                    switch (f.nextAddress) {
                        case 1:
                            if (!d.drmInfo) return f["return"]();
                            g = c.getEmeSessionCell();
                            h = d.sessionIds.map(function(a) {
                                return {
                                    sessionId: a,
                                    keySystem: d.drmInfo.keySystem,
                                    licenseUri: d.drmInfo.licenseServerUri,
                                    serverCertificate: d.drmInfo.serverCertificate,
                                    audioCapabilities: shaka.offline.Storage.getCapabilities_(d,
                                        !1),
                                    videoCapabilities: shaka.offline.Storage.getCapabilities_(d, !0)
                                }
                            });
                            k = new shaka.offline.SessionDeleter;
                            return f.yield(k["delete"](b, a, h), 2);
                        case 2:
                            return l = f.yieldResult, f.yield(g.remove(l), 3);
                        case 3:
                            return f.yield(g.add(h.filter(function(a) {
                                return -1 == l.indexOf(a.sessionId)
                            })), 0)
                    }
                })
            })
        };
        shaka.offline.Storage.getAllStreamsFromManifest_ = function(a) {
            var b = new Set;
            a = $jscomp.makeIterator(a.periods);
            for (var c = a.next(); !c.done; c = a.next()) {
                c = c.value;
                for (var d = $jscomp.makeIterator(c.textStreams), e = d.next(); !e.done; e = d.next()) b.add(e.value);
                c = $jscomp.makeIterator(c.variants);
                for (d = c.next(); !d.done; d = c.next()) d = d.value, d.audio && b.add(d.audio), d.video && b.add(d.video)
            }
            return b
        };
        shaka.offline.Storage.getAllStreamsFromPeriod_ = function(a) {
            for (var b = new Set, c = $jscomp.makeIterator(a.textStreams), d = c.next(); !d.done; d = c.next()) b.add(d.value);
            a = $jscomp.makeIterator(a.variants);
            for (c = a.next(); !c.done; c = a.next()) c = c.value, c.audio && b.add(c.audio), c.video && b.add(c.video);
            return b
        };
        shaka.offline.Storage.verifyConfig_ = function(a) {
            var b = !1;
            null != a.trackSelectionCallback && (b = !0, a.offline = a.offline || {}, a.offline.trackSelectionCallback = a.trackSelectionCallback, delete a.trackSelectionCallback);
            null != a.progressCallback && (b = !0, a.offline = a.offline || {}, a.offline.progressCallback = a.progressCallback, delete a.progressCallback);
            null != a.usePersistentLicense && (b = !0, a.offline = a.offline || {}, a.offline.usePersistentLicense = a.usePersistentLicense, delete a.usePersistentLicense);
            b && shaka.Deprecate.deprecateFeature(2,
                6, "Storage.configure with OfflineConfig", "Please configure storage with a player configuration.")
        };
        shaka.offline.Storage.validateManifest_ = function(a) {
            if (0 == a.periods.length) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.MANIFEST, shaka.util.Error.Code.NO_PERIODS);
            a = $jscomp.makeIterator(a.periods);
            for (var b = a.next(); !b.done; b = a.next()) shaka.offline.Storage.validatePeriod_(b.value)
        };
        shaka.offline.Storage.validatePeriod_ = function(a) {
            var b = new Set(a.variants.map(function(a) {
                    return a.video
                })),
                c = new Set(a.variants.map(function(a) {
                    return a.audio
                }));
            a = a.textStreams;
            1 < b.size && shaka.log.warning("Multiple video tracks selected to be stored");
            b = $jscomp.makeIterator(c);
            for (var d = b.next(); !d.done; d = b.next()) {
                d = d.value;
                for (var e = $jscomp.makeIterator(c), f = e.next(); !f.done; f = e.next()) f = f.value, d != f && d.language == f.language && shaka.log.warning("Similar audio tracks were selected to be stored",
                    d.id, f.id)
            }
            c = $jscomp.makeIterator(a);
            for (b = c.next(); !b.done; b = c.next())
                for (b = b.value, d = $jscomp.makeIterator(a), e = d.next(); !e.done; e = d.next()) e = e.value, b != e && b.language == e.language && shaka.log.warning("Similar text tracks were selected to be stored", b.id, e.id)
        };
        shaka.offline.Storage.defaultSystemIds_ = (new Map).set("org.w3.clearkey", "1077efecc0b24d02ace33c1e52e2fb4b").set("com.widevine.alpha", "edef8ba979d64acea3c827dcd51d21ed").set("com.microsoft.playready", "9a04f07998404286ab92e65be0885f95").set("com.adobe.primetime", "f239e769efa348509c16a903c6932efb");
        shaka.Player.registerSupportPlugin("offline", shaka.offline.Storage.support);
        shaka.polyfill = {};
        shaka.polyfill.installAll = function() {
            for (var a = 0; a < shaka.polyfill.polyfills_.length; ++a) try {
                shaka.polyfill.polyfills_[a].callback()
            } catch (b) {
                shaka.log.alwaysWarn("Error installing polyfill!", b)
            }
        };
        goog.exportSymbol("shaka.polyfill.installAll", shaka.polyfill.installAll);
        shaka.polyfill.polyfills_ = [];
        shaka.polyfill.register = function(a, b) {
            b = b || 0;
            for (var c = {
                    priority: b,
                    callback: a
                }, d = 0; d < shaka.polyfill.polyfills_.length; d++)
                if (shaka.polyfill.polyfills_[d].priority < b) {
                    shaka.polyfill.polyfills_.splice(d, 0, c);
                    return
                } shaka.polyfill.polyfills_.push(c)
        };
        goog.exportSymbol("shaka.polyfill.register", shaka.polyfill.register);
        shaka.polyfill.EncryptionScheme = function() {};
        shaka.polyfill.EncryptionScheme.install = function() {
            EncryptionSchemePolyfills.install()
        };
        shaka.polyfill.register(shaka.polyfill.EncryptionScheme.install, -1);
        shaka.polyfill.Fullscreen = {};
        shaka.polyfill.Fullscreen.install = function() {
            if (window.Document) {
                var a = Element.prototype;
                a.requestFullscreen = a.requestFullscreen || a.mozRequestFullScreen || a.msRequestFullscreen || a.webkitRequestFullscreen;
                a = Document.prototype;
                a.exitFullscreen = a.exitFullscreen || a.mozCancelFullScreen || a.msExitFullscreen || a.webkitCancelFullScreen;
                "fullscreenElement" in document || (Object.defineProperty(document, "fullscreenElement", {
                    get: function() {
                        return document.mozFullScreenElement || document.msFullscreenElement || document.webkitCurrentFullScreenElement ||
                            document.webkitFullscreenElement
                    }
                }), Object.defineProperty(document, "fullscreenEnabled", {
                    get: function() {
                        return document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitFullscreenEnabled
                    }
                }));
                a = shaka.polyfill.Fullscreen.proxyEvent_;
                document.addEventListener("webkitfullscreenchange", a);
                document.addEventListener("webkitfullscreenerror", a);
                document.addEventListener("mozfullscreenchange", a);
                document.addEventListener("mozfullscreenerror", a);
                document.addEventListener("MSFullscreenChange",
                    a);
                document.addEventListener("MSFullscreenError", a)
            }
        };
        shaka.polyfill.Fullscreen.proxyEvent_ = function(a) {
            var b = a.type.replace(/^(webkit|moz|MS)/, "").toLowerCase();
            if ("function" === typeof Event) var c = new Event(b, a);
            else c = document.createEvent("Event"), c.initEvent(b, a.bubbles, a.cancelable);
            a.target.dispatchEvent(c)
        };
        shaka.polyfill.register(shaka.polyfill.Fullscreen.install);
        shaka.polyfill.InputEvent = {};
        shaka.polyfill.InputEvent.install = function() {
            shaka.log.debug("InputEvent.install");
            shaka.util.Platform.isIE() && !HTMLInputElement.prototype.originalAddEventListener && (shaka.log.info("Patching input event support on IE."), HTMLInputElement.prototype.originalAddEventListener = HTMLInputElement.prototype.addEventListener, HTMLInputElement.prototype.addEventListener = shaka.polyfill.InputEvent.addEventListener_)
        };
        shaka.polyfill.InputEvent.addEventListener_ = function(a, b, c) {
            if ("input" == a) switch (this.type) {
                case "range":
                    a = "change"
            }
            HTMLInputElement.prototype.originalAddEventListener.call(this, a, b, c)
        };
        shaka.polyfill.register(shaka.polyfill.InputEvent.install);
        shaka.polyfill.Languages = {};
        shaka.polyfill.Languages.install = function() {
            navigator.languages || Object.defineProperty(navigator, "languages", {
                get: function() {
                    return navigator.language ? [navigator.language] : ["en"]
                }
            })
        };
        shaka.polyfill.register(shaka.polyfill.Languages.install);
        shaka.polyfill.MathRound = {};
        shaka.polyfill.MathRound.MAX_ACCURATE_INPUT_ = 4503599627370496;
        shaka.polyfill.MathRound.install = function() {
            shaka.log.debug("mathRound.install");
            var a = shaka.polyfill.MathRound.MAX_ACCURATE_INPUT_ + 1;
            if (Math.round(a) != a) {
                shaka.log.debug("polyfill Math.round");
                var b = Math.round;
                Math.round = function(a) {
                    var c = a;
                    a <= shaka.polyfill.MathRound.MAX_ACCURATE_INPUT_ && (c = b(a));
                    return c
                }
            }
        };
        shaka.polyfill.register(shaka.polyfill.MathRound.install);
        shaka.polyfill.MediaSource = {};
        shaka.polyfill.MediaSource.install = function() {
            shaka.log.debug("MediaSource.install");
            var a = shaka.util.Platform.safariVersion();
            window.MediaSource ? window.cast && cast.__platform__ && cast.__platform__.canDisplayType ? (shaka.log.info("Patching Chromecast MSE bugs."), shaka.polyfill.MediaSource.patchCastIsTypeSupported_()) : a ? (shaka.polyfill.MediaSource.rejectTsContent_(), 12 >= a ? (shaka.log.info("Patching Safari 11 & 12 MSE bugs."), shaka.polyfill.MediaSource.stubAbort_(), shaka.polyfill.MediaSource.patchRemovalRange_()) : (shaka.log.info("Patching Safari 13 MSE bugs."),
                shaka.polyfill.MediaSource.stubAbort_())) : shaka.util.Platform.isTizen2() || shaka.util.Platform.isTizen3() || shaka.util.Platform.isTizen4() ? shaka.polyfill.MediaSource.rejectCodec_("opus") : shaka.log.info("Using native MSE as-is.") : shaka.log.info("No MSE implementation available.")
        };
        shaka.polyfill.MediaSource.blacklist_ = function() {
            window.MediaSource = null
        };
        shaka.polyfill.MediaSource.stubAbort_ = function() {
            var a = MediaSource.prototype.addSourceBuffer;
            MediaSource.prototype.addSourceBuffer = function(b) {
                for (var c = [], d = 0; d < arguments.length; ++d) c[d - 0] = arguments[d];
                c = a.apply(this, c);
                c.abort = function() {};
                return c
            }
        };
        shaka.polyfill.MediaSource.patchRemovalRange_ = function() {
            var a = SourceBuffer.prototype.remove;
            SourceBuffer.prototype.remove = function(b, c) {
                return a.call(this, b, c - .001)
            }
        };
        shaka.polyfill.MediaSource.rejectTsContent_ = function() {
            var a = MediaSource.isTypeSupported;
            MediaSource.isTypeSupported = function(b) {
                return "mp2t" == b.split(/ *; */)[0].split("/")[1].toLowerCase() ? !1 : a(b)
            }
        };
        shaka.polyfill.MediaSource.rejectCodec_ = function(a) {
            var b = MediaSource.isTypeSupported;
            MediaSource.isTypeSupported = function(c) {
                return shaka.util.MimeUtils.getCodecBase(c) != a && b(c)
            }
        };
        shaka.polyfill.MediaSource.patchCastIsTypeSupported_ = function() {
            var a = MediaSource.isTypeSupported;
            MediaSource.isTypeSupported = function(b) {
                var c = b.split(/ *; */);
                c.shift();
                return c.some(function(a) {
                    return a.startsWith("codecs=")
                }) ? cast.__platform__.canDisplayType(b) : a(b)
            }
        };
        shaka.polyfill.register(shaka.polyfill.MediaSource.install);
        shaka.polyfill.PatchedMediaKeysApple = {};
        shaka.polyfill.PatchedMediaKeysApple.install = function() {
            if (window.HTMLVideoElement && window.WebKitMediaKeys) {
                shaka.log.info("Using Apple-prefixed EME");
                var a = shaka.polyfill.PatchedMediaKeysApple;
                a.MediaKeyStatusMap.KEY_ID_ = (new Uint8Array([0])).buffer;
                delete HTMLMediaElement.prototype.mediaKeys;
                HTMLMediaElement.prototype.mediaKeys = null;
                HTMLMediaElement.prototype.setMediaKeys = a.setMediaKeys;
                window.MediaKeys = a.MediaKeys;
                window.MediaKeySystemAccess = a.MediaKeySystemAccess;
                navigator.requestMediaKeySystemAccess =
                    a.requestMediaKeySystemAccess
            }
        };
        shaka.polyfill.PatchedMediaKeysApple.requestMediaKeySystemAccess = function(a, b) {
            shaka.log.debug("PatchedMediaKeysApple.requestMediaKeySystemAccess");
            goog.asserts.assert(this == navigator, 'bad "this" for requestMediaKeySystemAccess');
            var c = shaka.polyfill.PatchedMediaKeysApple;
            try {
                var d = new c.MediaKeySystemAccess(a, b);
                return Promise.resolve(d)
            } catch (e) {
                return Promise.reject(e)
            }
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySystemAccess = function(a, b) {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySystemAccess");
            this.keySystem = a;
            if (a.startsWith("com.apple.fps"))
                for (var c = $jscomp.makeIterator(b), d = c.next(); !d.done; d = c.next())
                    if (d = this.checkConfig_(d.value)) {
                        this.configuration_ = d;
                        return
                    } c = Error("Unsupported keySystem");
            c.name = "NotSupportedError";
            c.code = DOMException.NOT_SUPPORTED_ERR;
            throw c;
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySystemAccess.prototype.checkConfig_ = function(a) {
            if ("required" == a.persistentState) return null;
            var b = {
                    audioCapabilities: [],
                    videoCapabilities: [],
                    persistentState: "optional",
                    distinctiveIdentifier: "optional",
                    initDataTypes: a.initDataTypes,
                    sessionTypes: ["temporary"],
                    label: a.label
                },
                c = !1,
                d = !1;
            if (a.audioCapabilities)
                for (var e = $jscomp.makeIterator(a.audioCapabilities), f = e.next(); !f.done; f = e.next())
                    if (f = f.value, f.contentType) {
                        c = !0;
                        var g = f.contentType.split(";")[0];
                        WebKitMediaKeys.isTypeSupported(this.keySystem, g) && (b.audioCapabilities.push(f), d = !0)
                    } if (a.videoCapabilities)
                for (a = $jscomp.makeIterator(a.videoCapabilities), f = a.next(); !f.done; f = a.next()) e = f.value, e.contentType && (c = !0, f = e.contentType.split(";")[0], WebKitMediaKeys.isTypeSupported(this.keySystem, f) && (b.videoCapabilities.push(e), d = !0));
            c || (d = WebKitMediaKeys.isTypeSupported(this.keySystem, "video/mp4"));
            return d ? b : null
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySystemAccess.prototype.createMediaKeys = function() {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySystemAccess.createMediaKeys");
            var a = new shaka.polyfill.PatchedMediaKeysApple.MediaKeys(this.keySystem);
            return Promise.resolve(a)
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySystemAccess.prototype.getConfiguration = function() {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySystemAccess.getConfiguration");
            return this.configuration_
        };
        shaka.polyfill.PatchedMediaKeysApple.setMediaKeys = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.setMediaKeys");
            goog.asserts.assert(this instanceof HTMLMediaElement, 'bad "this" for setMediaKeys');
            var b = shaka.polyfill.PatchedMediaKeysApple,
                c = this.mediaKeys;
            c && c != a && (goog.asserts.assert(c instanceof b.MediaKeys, "non-polyfill instance of oldMediaKeys"), c.setMedia(null));
            delete this.mediaKeys;
            return (this.mediaKeys = a) ? (goog.asserts.assert(a instanceof b.MediaKeys, "non-polyfill instance of newMediaKeys"),
                a.setMedia(this)) : Promise.resolve()
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeys = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeys");
            this.nativeMediaKeys_ = new WebKitMediaKeys(a);
            this.eventManager_ = new shaka.util.EventManager;
            this.certificate = null
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeys.prototype.createSession = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeys.createSession");
            a = a || "temporary";
            if ("temporary" != a) throw new TypeError("Session type " + a + " is unsupported on this platform.");
            return new shaka.polyfill.PatchedMediaKeysApple.MediaKeySession(this.nativeMediaKeys_, a)
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeys.prototype.setServerCertificate = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeys.setServerCertificate");
            this.certificate = a ? new Uint8Array(a) : null;
            return Promise.resolve(!0)
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeys.prototype.setMedia = function(a) {
            var b = this,
                c = shaka.polyfill.PatchedMediaKeysApple;
            this.eventManager_.removeAll();
            if (!a) return Promise.resolve();
            this.eventManager_.listen(a, "webkitneedkey", c.onWebkitNeedKey_);
            try {
                return shaka.util.MediaReadyState.waitForReadyState(a, HTMLMediaElement.HAVE_METADATA, this.eventManager_, function() {
                    a.webkitSetMediaKeys(b.nativeMediaKeys_)
                }), Promise.resolve()
            } catch (d) {
                return Promise.reject(d)
            }
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession = function(a, b) {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySession");
            shaka.util.FakeEventTarget.call(this);
            this.nativeMediaKeySession_ = null;
            this.nativeMediaKeys_ = a;
            this.updatePromise_ = this.generateRequestPromise_ = null;
            this.eventManager_ = new shaka.util.EventManager;
            this.sessionId = "";
            this.expiration = NaN;
            this.closed = new shaka.util.PublicPromise;
            this.keyStatuses = new shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap
        };
        goog.inherits(shaka.polyfill.PatchedMediaKeysApple.MediaKeySession, shaka.util.FakeEventTarget);
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.generateRequest = function(a, b) {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySession.generateRequest");
            this.generateRequestPromise_ = new shaka.util.PublicPromise;
            try {
                this.nativeMediaKeySession_ = this.nativeMediaKeys_.createSession("video/mp4", new Uint8Array(b)), this.sessionId = this.nativeMediaKeySession_.sessionId || "", this.eventManager_.listen(this.nativeMediaKeySession_, "webkitkeymessage", this.onWebkitKeyMessage_.bind(this)), this.eventManager_.listen(this.nativeMediaKeySession_,
                    "webkitkeyadded", this.onWebkitKeyAdded_.bind(this)), this.eventManager_.listen(this.nativeMediaKeySession_, "webkitkeyerror", this.onWebkitKeyError_.bind(this)), this.updateKeyStatus_("status-pending")
            } catch (c) {
                this.generateRequestPromise_.reject(c)
            }
            return this.generateRequestPromise_
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.load = function() {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySession.load");
            return Promise.reject(Error("MediaKeySession.load not yet supported"))
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.update = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySession.update");
            this.updatePromise_ = new shaka.util.PublicPromise;
            try {
                this.nativeMediaKeySession_.update(new Uint8Array(a))
            } catch (b) {
                this.updatePromise_.reject(b)
            }
            return this.updatePromise_
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.close = function() {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySession.close");
            try {
                this.nativeMediaKeySession_.close(), this.closed.resolve(), this.eventManager_.removeAll()
            } catch (a) {
                this.closed.reject(a)
            }
            return this.closed
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.remove = function() {
            shaka.log.debug("PatchedMediaKeysApple.MediaKeySession.remove");
            return Promise.reject(Error("MediaKeySession.remove is only applicable for persistent licenses, which are not supported on this platform"))
        };
        shaka.polyfill.PatchedMediaKeysApple.onWebkitNeedKey_ = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.onWebkitNeedKey_", a);
            goog.asserts.assert(this.mediaKeys instanceof shaka.polyfill.PatchedMediaKeysApple.MediaKeys, "non-polyfill instance of newMediaKeys");
            goog.asserts.assert(null != a.initData, "missing init data!");
            a = new Uint8Array(a.initData);
            if ((new DataView(a.buffer, a.byteOffset, a.byteLength)).getUint32(0, !0) + 4 != a.byteLength) throw new RangeError("Malformed FairPlay init data");
            a = shaka.util.StringUtils.fromUTF16(a.subarray(4),
                !0);
            a = shaka.util.StringUtils.toUTF8(a);
            var b = new Event("encrypted");
            b.initDataType = "skd";
            b.initData = a;
            this.dispatchEvent(b)
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.onWebkitKeyMessage_ = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.onWebkitKeyMessage_", a);
            goog.asserts.assert(this.generateRequestPromise_, "generateRequestPromise_ should be set before now!");
            this.generateRequestPromise_ && (this.generateRequestPromise_.resolve(), this.generateRequestPromise_ = null);
            var b = void 0 == this.keyStatuses.getStatus();
            a = new shaka.util.FakeEvent("message", {
                messageType: b ? "license-request" : "license-renewal",
                message: a.message.buffer
            });
            this.dispatchEvent(a)
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.onWebkitKeyAdded_ = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.onWebkitKeyAdded_", a);
            goog.asserts.assert(!this.generateRequestPromise_, "Key added during generate!");
            goog.asserts.assert(this.updatePromise_, "updatePromise_ should be set before now!");
            this.updatePromise_ && (this.updateKeyStatus_("usable"), this.updatePromise_.resolve(), this.updatePromise_ = null)
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.onWebkitKeyError_ = function(a) {
            shaka.log.debug("PatchedMediaKeysApple.onWebkitKeyError_", a);
            a = Error("EME PatchedMediaKeysApple key error");
            a.errorCode = this.nativeMediaKeySession_.error;
            if (null != this.generateRequestPromise_) this.generateRequestPromise_.reject(a), this.generateRequestPromise_ = null;
            else if (null != this.updatePromise_) this.updatePromise_.reject(a), this.updatePromise_ = null;
            else switch (this.nativeMediaKeySession_.error.code) {
                case WebKitMediaKeyError.MEDIA_KEYERR_OUTPUT:
                case WebKitMediaKeyError.MEDIA_KEYERR_HARDWARECHANGE:
                    this.updateKeyStatus_("output-not-allowed");
                    break;
                default:
                    this.updateKeyStatus_("internal-error")
            }
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeySession.prototype.updateKeyStatus_ = function(a) {
            this.keyStatuses.setStatus(a);
            a = new shaka.util.FakeEvent("keystatuseschange");
            this.dispatchEvent(a)
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap = function() {
            this.size = 0;
            this.status_ = void 0
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.prototype.setStatus = function(a) {
            this.size = void 0 == a ? 0 : 1;
            this.status_ = a
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.prototype.getStatus = function() {
            return this.status_
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.prototype.forEach = function(a) {
            this.status_ && a(this.status_, shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.KEY_ID_)
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.prototype.get = function(a) {
            if (this.has(a)) return this.status_
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.prototype.has = function(a) {
            var b = shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.KEY_ID_;
            return this.status_ && shaka.util.Uint8ArrayUtils.equal(new Uint8Array(a), new Uint8Array(b)) ? !0 : !1
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.prototype.entries = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for the compiler.")
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.prototype.keys = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for the compiler.")
        };
        shaka.polyfill.PatchedMediaKeysApple.MediaKeyStatusMap.prototype.values = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for the compiler.")
        };
        shaka.polyfill.register(shaka.polyfill.PatchedMediaKeysApple.install);
        shaka.polyfill.PatchedMediaKeysMs = {};
        shaka.polyfill.PatchedMediaKeysMs.install = function() {
            if (window.HTMLVideoElement && window.MSMediaKeys && (!navigator.requestMediaKeySystemAccess || !MediaKeySystemAccess.prototype.getConfiguration)) {
                shaka.log.info("Using ms-prefixed EME v20140218");
                var a = shaka.polyfill.PatchedMediaKeysMs;
                a.MediaKeyStatusMap.KEY_ID_ = (new Uint8Array([0])).buffer;
                delete HTMLMediaElement.prototype.mediaKeys;
                HTMLMediaElement.prototype.mediaKeys = null;
                HTMLMediaElement.prototype.setMediaKeys = a.setMediaKeys;
                window.MediaKeys = a.MediaKeys;
                window.MediaKeySystemAccess = a.MediaKeySystemAccess;
                navigator.requestMediaKeySystemAccess = a.requestMediaKeySystemAccess
            }
        };
        shaka.polyfill.PatchedMediaKeysMs.requestMediaKeySystemAccess = function(a, b) {
            shaka.log.debug("PatchedMediaKeysMs.requestMediaKeySystemAccess");
            goog.asserts.assert(this == navigator, 'bad "this" for requestMediaKeySystemAccess');
            var c = shaka.polyfill.PatchedMediaKeysMs;
            try {
                var d = new c.MediaKeySystemAccess(a, b);
                return Promise.resolve(d)
            } catch (e) {
                return Promise.reject(e)
            }
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySystemAccess = function(a, b) {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySystemAccess");
            this.keySystem = a;
            for (var c = !1, d = 0; d < b.length; ++d) {
                var e = b[d],
                    f = {
                        audioCapabilities: [],
                        videoCapabilities: [],
                        persistentState: "optional",
                        distinctiveIdentifier: "optional",
                        initDataTypes: e.initDataTypes,
                        sessionTypes: ["temporary"],
                        label: e.label
                    },
                    g = !1;
                if (e.audioCapabilities)
                    for (var h = 0; h < e.audioCapabilities.length; ++h) {
                        var k = e.audioCapabilities[h];
                        if (k.contentType) {
                            g = !0;
                            var l = k.contentType.split(";")[0];
                            MSMediaKeys.isTypeSupported(this.keySystem, l) && (f.audioCapabilities.push(k), c = !0)
                        }
                    }
                if (e.videoCapabilities)
                    for (h = 0; h < e.videoCapabilities.length; ++h) k = e.videoCapabilities[h], k.contentType && (g = !0, l = k.contentType.split(";")[0], MSMediaKeys.isTypeSupported(this.keySystem, l) && (f.videoCapabilities.push(k), c = !0));
                g || (c = MSMediaKeys.isTypeSupported(this.keySystem, "video/mp4"));
                "required" == e.persistentState && (c = !1);
                if (c) {
                    this.configuration_ = f;
                    return
                }
            }
            c = Error("Unsupported keySystem");
            c.name = "NotSupportedError";
            c.code = DOMException.NOT_SUPPORTED_ERR;
            throw c;
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySystemAccess.prototype.createMediaKeys = function() {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySystemAccess.createMediaKeys");
            var a = new shaka.polyfill.PatchedMediaKeysMs.MediaKeys(this.keySystem);
            return Promise.resolve(a)
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySystemAccess.prototype.getConfiguration = function() {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySystemAccess.getConfiguration");
            return this.configuration_
        };
        shaka.polyfill.PatchedMediaKeysMs.setMediaKeys = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.setMediaKeys");
            goog.asserts.assert(this instanceof HTMLMediaElement, 'bad "this" for setMediaKeys');
            var b = shaka.polyfill.PatchedMediaKeysMs,
                c = this.mediaKeys;
            c && c != a && (goog.asserts.assert(c instanceof b.MediaKeys, "non-polyfill instance of oldMediaKeys"), c.setMedia(null));
            delete this.mediaKeys;
            return (this.mediaKeys = a) ? (goog.asserts.assert(a instanceof b.MediaKeys, "non-polyfill instance of newMediaKeys"), a.setMedia(this)) :
                Promise.resolve()
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeys = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeys");
            this.nativeMediaKeys_ = new MSMediaKeys(a);
            this.eventManager_ = new shaka.util.EventManager
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeys.prototype.createSession = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeys.createSession");
            a = a || "temporary";
            if ("temporary" != a) throw new TypeError("Session type " + a + " is unsupported on this platform.");
            return new shaka.polyfill.PatchedMediaKeysMs.MediaKeySession(this.nativeMediaKeys_, a)
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeys.prototype.setServerCertificate = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeys.setServerCertificate");
            return Promise.resolve(!1)
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeys.prototype.setMedia = function(a) {
            var b = this,
                c = shaka.polyfill.PatchedMediaKeysMs;
            this.eventManager_.removeAll();
            if (!a) return Promise.resolve();
            this.eventManager_.listen(a, "msneedkey", c.onMsNeedKey_);
            try {
                return shaka.util.MediaReadyState.waitForReadyState(a, HTMLMediaElement.HAVE_METADATA, this.eventManager_, function() {
                    a.msSetMediaKeys(b.nativeMediaKeys_)
                }), Promise.resolve()
            } catch (d) {
                return Promise.reject(d)
            }
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession = function(a, b) {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySession");
            shaka.util.FakeEventTarget.call(this);
            this.nativeMediaKeySession_ = null;
            this.nativeMediaKeys_ = a;
            this.updatePromise_ = this.generateRequestPromise_ = null;
            this.eventManager_ = new shaka.util.EventManager;
            this.sessionId = "";
            this.expiration = NaN;
            this.closed = new shaka.util.PublicPromise;
            this.keyStatuses = new shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap
        };
        goog.inherits(shaka.polyfill.PatchedMediaKeysMs.MediaKeySession, shaka.util.FakeEventTarget);
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.generateRequest = function(a, b) {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySession.generateRequest");
            this.generateRequestPromise_ = new shaka.util.PublicPromise;
            try {
                this.nativeMediaKeySession_ = this.nativeMediaKeys_.createSession("video/mp4", new Uint8Array(b), null), this.eventManager_.listen(this.nativeMediaKeySession_, "mskeymessage", this.onMsKeyMessage_.bind(this)), this.eventManager_.listen(this.nativeMediaKeySession_, "mskeyadded", this.onMsKeyAdded_.bind(this)),
                    this.eventManager_.listen(this.nativeMediaKeySession_, "mskeyerror", this.onMsKeyError_.bind(this)), this.updateKeyStatus_("status-pending")
            } catch (c) {
                this.generateRequestPromise_.reject(c)
            }
            return this.generateRequestPromise_
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.load = function() {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySession.load");
            return Promise.reject(Error("MediaKeySession.load not yet supported"))
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.update = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySession.update");
            this.updatePromise_ = new shaka.util.PublicPromise;
            try {
                this.nativeMediaKeySession_.update(new Uint8Array(a))
            } catch (b) {
                this.updatePromise_.reject(b)
            }
            return this.updatePromise_
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.close = function() {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySession.close");
            try {
                this.nativeMediaKeySession_.close(), this.closed.resolve(), this.eventManager_.removeAll()
            } catch (a) {
                this.closed.reject(a)
            }
            return this.closed
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.remove = function() {
            shaka.log.debug("PatchedMediaKeysMs.MediaKeySession.remove");
            return Promise.reject(Error("MediaKeySession.remove is only applicable for persistent licenses, which are not supported on this platform"))
        };
        shaka.polyfill.PatchedMediaKeysMs.onMsNeedKey_ = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.onMsNeedKey_", a);
            if (a.initData) {
                var b = document.createEvent("CustomEvent");
                b.initCustomEvent("encrypted", !1, !1, null);
                b.initDataType = "cenc";
                b.initData = shaka.util.Pssh.normaliseInitData(a.initData).buffer;
                this.dispatchEvent(b)
            }
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.onMsKeyMessage_ = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.onMsKeyMessage_", a);
            goog.asserts.assert(this.generateRequestPromise_, "generateRequestPromise_ not set in onMsKeyMessage_");
            this.generateRequestPromise_ && (this.generateRequestPromise_.resolve(), this.generateRequestPromise_ = null);
            var b = void 0 == this.keyStatuses.getStatus();
            a = new shaka.util.FakeEvent("message", {
                messageType: b ? "license-request" : "license-renewal",
                message: a.message.buffer
            });
            this.dispatchEvent(a)
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.onMsKeyAdded_ = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.onMsKeyAdded_", a);
            this.generateRequestPromise_ ? (shaka.log.debug("Simulating completion for a PR persistent license."), goog.asserts.assert(!this.updatePromise_, "updatePromise_ and generateRequestPromise_ set in onMsKeyAdded_"), this.updateKeyStatus_("usable"), this.generateRequestPromise_.resolve(), this.generateRequestPromise_ = null) : (goog.asserts.assert(this.updatePromise_, "updatePromise_ not set in onMsKeyAdded_"),
                this.updatePromise_ && (this.updateKeyStatus_("usable"), this.updatePromise_.resolve(), this.updatePromise_ = null))
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.onMsKeyError_ = function(a) {
            shaka.log.debug("PatchedMediaKeysMs.onMsKeyError_", a);
            a = Error("EME PatchedMediaKeysMs key error");
            a.errorCode = this.nativeMediaKeySession_.error;
            if (null != this.generateRequestPromise_) this.generateRequestPromise_.reject(a), this.generateRequestPromise_ = null;
            else if (null != this.updatePromise_) this.updatePromise_.reject(a), this.updatePromise_ = null;
            else switch (this.nativeMediaKeySession_.error.code) {
                case MSMediaKeyError.MS_MEDIA_KEYERR_OUTPUT:
                case MSMediaKeyError.MS_MEDIA_KEYERR_HARDWARECHANGE:
                    this.updateKeyStatus_("output-not-allowed");
                    break;
                default:
                    this.updateKeyStatus_("internal-error")
            }
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeySession.prototype.updateKeyStatus_ = function(a) {
            this.keyStatuses.setStatus(a);
            a = new shaka.util.FakeEvent("keystatuseschange");
            this.dispatchEvent(a)
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap = function() {
            this.size = 0;
            this.status_ = void 0
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.prototype.setStatus = function(a) {
            this.size = void 0 == a ? 0 : 1;
            this.status_ = a
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.prototype.getStatus = function() {
            return this.status_
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.prototype.forEach = function(a) {
            this.status_ && a(this.status_, shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.KEY_ID_)
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.prototype.get = function(a) {
            if (this.has(a)) return this.status_
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.prototype.has = function(a) {
            var b = shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.KEY_ID_;
            return this.status_ && shaka.util.Uint8ArrayUtils.equal(new Uint8Array(a), new Uint8Array(b)) ? !0 : !1
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.prototype.entries = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for the compiler.")
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.prototype.keys = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for the compiler.")
        };
        shaka.polyfill.PatchedMediaKeysMs.MediaKeyStatusMap.prototype.values = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for the compiler.")
        };
        shaka.polyfill.register(shaka.polyfill.PatchedMediaKeysMs.install);
        shaka.polyfill.PatchedMediaKeysNop = {};
        shaka.polyfill.PatchedMediaKeysNop.install = function() {
            if (!(!window.HTMLVideoElement || navigator.requestMediaKeySystemAccess && MediaKeySystemAccess.prototype.getConfiguration)) {
                shaka.log.info("EME not available.");
                var a = shaka.polyfill.PatchedMediaKeysNop;
                navigator.requestMediaKeySystemAccess = a.requestMediaKeySystemAccess;
                delete HTMLMediaElement.prototype.mediaKeys;
                HTMLMediaElement.prototype.mediaKeys = null;
                HTMLMediaElement.prototype.setMediaKeys = a.setMediaKeys;
                window.MediaKeys = a.MediaKeys;
                window.MediaKeySystemAccess =
                    a.MediaKeySystemAccess
            }
        };
        shaka.polyfill.PatchedMediaKeysNop.requestMediaKeySystemAccess = function(a, b) {
            shaka.log.debug("PatchedMediaKeysNop.requestMediaKeySystemAccess");
            goog.asserts.assert(this == navigator, 'bad "this" for requestMediaKeySystemAccess');
            return Promise.reject(Error("The key system specified is not supported."))
        };
        shaka.polyfill.PatchedMediaKeysNop.setMediaKeys = function(a) {
            shaka.log.debug("PatchedMediaKeysNop.setMediaKeys");
            goog.asserts.assert(this instanceof HTMLMediaElement, 'bad "this" for setMediaKeys');
            return null == a ? Promise.resolve() : Promise.reject(Error("MediaKeys not supported."))
        };
        shaka.polyfill.PatchedMediaKeysNop.MediaKeys = function() {
            throw new TypeError("Illegal constructor.");
        };
        shaka.polyfill.PatchedMediaKeysNop.MediaKeys.prototype.createSession = function() {};
        shaka.polyfill.PatchedMediaKeysNop.MediaKeys.prototype.setServerCertificate = function() {};
        shaka.polyfill.PatchedMediaKeysNop.MediaKeySystemAccess = function() {
            throw new TypeError("Illegal constructor.");
        };
        shaka.polyfill.PatchedMediaKeysNop.MediaKeySystemAccess.prototype.getConfiguration = function() {};
        shaka.polyfill.PatchedMediaKeysNop.MediaKeySystemAccess.prototype.createMediaKeys = function() {};
        shaka.polyfill.register(shaka.polyfill.PatchedMediaKeysNop.install, -10);
        shaka.polyfill.PatchedMediaKeysWebkit = {};
        shaka.polyfill.PatchedMediaKeysWebkit.prefix_ = "";
        shaka.polyfill.PatchedMediaKeysWebkit.install = function() {
            var a = shaka.polyfill.PatchedMediaKeysWebkit,
                b = a.prefixApi_;
            if (!(!window.HTMLVideoElement || navigator.requestMediaKeySystemAccess && MediaKeySystemAccess.prototype.getConfiguration)) {
                if (HTMLMediaElement.prototype.webkitGenerateKeyRequest) shaka.log.info("Using webkit-prefixed EME v0.1b"), a.prefix_ = "webkit";
                else if (HTMLMediaElement.prototype.generateKeyRequest) shaka.log.info("Using nonprefixed EME v0.1b");
                else return;
                goog.asserts.assert(HTMLMediaElement.prototype[b("generateKeyRequest")],
                    "PatchedMediaKeysWebkit APIs not available!");
                a.MediaKeyStatusMap.KEY_ID_ = (new Uint8Array([0])).buffer;
                navigator.requestMediaKeySystemAccess = a.requestMediaKeySystemAccess;
                delete HTMLMediaElement.prototype.mediaKeys;
                HTMLMediaElement.prototype.mediaKeys = null;
                HTMLMediaElement.prototype.setMediaKeys = a.setMediaKeys;
                window.MediaKeys = a.MediaKeys;
                window.MediaKeySystemAccess = a.MediaKeySystemAccess
            }
        };
        shaka.polyfill.PatchedMediaKeysWebkit.prefixApi_ = function(a) {
            var b = shaka.polyfill.PatchedMediaKeysWebkit.prefix_;
            return b ? b + a.charAt(0).toUpperCase() + a.slice(1) : a
        };
        shaka.polyfill.PatchedMediaKeysWebkit.requestMediaKeySystemAccess = function(a, b) {
            shaka.log.debug("PatchedMediaKeysWebkit.requestMediaKeySystemAccess");
            goog.asserts.assert(this == navigator, 'bad "this" for requestMediaKeySystemAccess');
            var c = shaka.polyfill.PatchedMediaKeysWebkit;
            try {
                var d = new c.MediaKeySystemAccess(a, b);
                return Promise.resolve(d)
            } catch (e) {
                return Promise.reject(e)
            }
        };
        shaka.polyfill.PatchedMediaKeysWebkit.setMediaKeys = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.setMediaKeys");
            goog.asserts.assert(this instanceof HTMLMediaElement, 'bad "this" for setMediaKeys');
            var b = shaka.polyfill.PatchedMediaKeysWebkit,
                c = this.mediaKeys;
            c && c != a && (goog.asserts.assert(c instanceof b.MediaKeys, "non-polyfill instance of oldMediaKeys"), c.setMedia(null));
            delete this.mediaKeys;
            if (this.mediaKeys = a) goog.asserts.assert(a instanceof b.MediaKeys, "non-polyfill instance of newMediaKeys"),
                a.setMedia(this);
            return Promise.resolve()
        };
        shaka.polyfill.PatchedMediaKeysWebkit.getVideoElement_ = function() {
            var a = document.getElementsByTagName("video");
            return a.length ? a[0] : document.createElement("video")
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySystemAccess = function(a, b) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySystemAccess");
            this.internalKeySystem_ = this.keySystem = a;
            var c = !1;
            "org.w3.clearkey" == a && (this.internalKeySystem_ = "webkit-org.w3.clearkey", c = !1);
            for (var d = !1, e = shaka.polyfill.PatchedMediaKeysWebkit.getVideoElement_(), f = 0; f < b.length; ++f) {
                var g = b[f],
                    h = {
                        audioCapabilities: [],
                        videoCapabilities: [],
                        persistentState: "optional",
                        distinctiveIdentifier: "optional",
                        initDataTypes: g.initDataTypes,
                        sessionTypes: ["temporary"],
                        label: g.label
                    },
                    k = !1;
                if (g.audioCapabilities)
                    for (var l = 0; l < g.audioCapabilities.length; ++l) {
                        var m = g.audioCapabilities[l];
                        if (m.contentType) {
                            k = !0;
                            var n = m.contentType.split(";")[0];
                            e.canPlayType(n, this.internalKeySystem_) && (h.audioCapabilities.push(m), d = !0)
                        }
                    }
                if (g.videoCapabilities)
                    for (l = 0; l < g.videoCapabilities.length; ++l) m = g.videoCapabilities[l], m.contentType && (k = !0, e.canPlayType(m.contentType, this.internalKeySystem_) && (h.videoCapabilities.push(m), d = !0));
                k || (d = e.canPlayType("video/mp4",
                    this.internalKeySystem_) || e.canPlayType("video/webm", this.internalKeySystem_));
                "required" == g.persistentState && (c ? (h.persistentState = "required", h.sessionTypes = ["persistent-license"]) : d = !1);
                if (d) {
                    this.configuration_ = h;
                    return
                }
            }
            c = "Unsupported keySystem";
            if ("org.w3.clearkey" == a || "com.widevine.alpha" == a) c = "None of the requested configurations were supported.";
            c = Error(c);
            c.name = "NotSupportedError";
            c.code = DOMException.NOT_SUPPORTED_ERR;
            throw c;
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySystemAccess.prototype.createMediaKeys = function() {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySystemAccess.createMediaKeys");
            var a = new shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys(this.internalKeySystem_);
            return Promise.resolve(a)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySystemAccess.prototype.getConfiguration = function() {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySystemAccess.getConfiguration");
            return this.configuration_
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeys");
            this.keySystem_ = a;
            this.media_ = null;
            this.eventManager_ = new shaka.util.EventManager;
            this.newSessions_ = [];
            this.sessionMap_ = {}
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys.prototype.setMedia = function(a) {
            this.media_ = a;
            this.eventManager_.removeAll();
            var b = shaka.polyfill.PatchedMediaKeysWebkit.prefix_;
            a && (this.eventManager_.listen(a, b + "needkey", this.onWebkitNeedKey_.bind(this)), this.eventManager_.listen(a, b + "keymessage", this.onWebkitKeyMessage_.bind(this)), this.eventManager_.listen(a, b + "keyadded", this.onWebkitKeyAdded_.bind(this)), this.eventManager_.listen(a, b + "keyerror", this.onWebkitKeyError_.bind(this)))
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys.prototype.createSession = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeys.createSession");
            a = a || "temporary";
            if ("temporary" != a && "persistent-license" != a) throw new TypeError("Session type " + a + " is unsupported on this platform.");
            var b = shaka.polyfill.PatchedMediaKeysWebkit,
                c = this.media_ || document.createElement("video");
            c.src || (c.src = "about:blank");
            a = new b.MediaKeySession(c, this.keySystem_, a);
            this.newSessions_.push(a);
            return a
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys.prototype.setServerCertificate = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeys.setServerCertificate");
            return Promise.resolve(!1)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys.prototype.onWebkitNeedKey_ = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.onWebkitNeedKey_", a);
            goog.asserts.assert(this.media_, "media_ not set in onWebkitNeedKey_");
            var b = document.createEvent("CustomEvent");
            b.initCustomEvent("encrypted", !1, !1, null);
            b.initDataType = "cenc";
            b.initData = a.initData instanceof ArrayBuffer ? a.initData : a.initData.buffer;
            this.media_.dispatchEvent(b)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys.prototype.onWebkitKeyMessage_ = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.onWebkitKeyMessage_", a);
            var b = this.findSession_(a.sessionId);
            if (b) {
                var c = void 0 == b.keyStatuses.getStatus();
                a = new shaka.util.FakeEvent("message", {
                    messageType: c ? "licenserequest" : "licenserenewal",
                    message: a.message
                });
                b.generated();
                b.dispatchEvent(a)
            } else shaka.log.error("Session not found", a.sessionId)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys.prototype.onWebkitKeyAdded_ = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.onWebkitKeyAdded_", a);
            a = this.findSession_(a.sessionId);
            goog.asserts.assert(a, "unable to find session in onWebkitKeyAdded_");
            a && a.ready()
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys.prototype.onWebkitKeyError_ = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.onWebkitKeyError_", a);
            var b = this.findSession_(a.sessionId);
            goog.asserts.assert(b, "unable to find session in onWebkitKeyError_");
            b && b.handleError(a)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeys.prototype.findSession_ = function(a) {
            var b = this.sessionMap_[a];
            return b ? (shaka.log.debug("PatchedMediaKeysWebkit.MediaKeys.findSession_", b), b) : (b = this.newSessions_.shift()) ? (b.sessionId = a, this.sessionMap_[a] = b, shaka.log.debug("PatchedMediaKeysWebkit.MediaKeys.findSession_", b), b) : null
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession = function(a, b, c) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession");
            shaka.util.FakeEventTarget.call(this);
            this.media_ = a;
            this.initialized_ = !1;
            this.updatePromise_ = this.generatePromise_ = null;
            this.keySystem_ = b;
            this.type_ = c;
            this.sessionId = "";
            this.expiration = NaN;
            this.closed = new shaka.util.PublicPromise;
            this.keyStatuses = new shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap
        };
        goog.inherits(shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession, shaka.util.FakeEventTarget);
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.generated = function() {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession.generated");
            this.generatePromise_ && (this.generatePromise_.resolve(), this.generatePromise_ = null)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.ready = function() {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession.ready");
            this.updateKeyStatus_("usable");
            this.updatePromise_ && this.updatePromise_.resolve();
            this.updatePromise_ = null
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.handleError = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession.handleError", a);
            var b = Error("EME v0.1b key error"),
                c = a.errorCode;
            c.systemCode = a.systemCode;
            b.errorCode = c;
            !a.sessionId && this.generatePromise_ ? (45 == a.systemCode && (b.message = "Unsupported session type."), this.generatePromise_.reject(b), this.generatePromise_ = null) : a.sessionId && this.updatePromise_ ? (this.updatePromise_.reject(b), this.updatePromise_ = null) : (b = a.systemCode,
                a.errorCode.code == MediaKeyError.MEDIA_KEYERR_OUTPUT ? this.updateKeyStatus_("output-restricted") : 1 == b ? this.updateKeyStatus_("expired") : this.updateKeyStatus_("internal-error"))
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.generate_ = function(a, b) {
            var c = this;
            if (this.initialized_) return Promise.reject(Error("The session is already initialized."));
            this.initialized_ = !0;
            try {
                if ("persistent-license" == this.type_) {
                    var d = shaka.util.StringUtils;
                    if (b) var e = new Uint8Array(d.toUTF8("LOAD_SESSION|" + b));
                    else {
                        var f = d.toUTF8("PERSISTENT|"),
                            g = new Uint8Array(f.byteLength + a.byteLength);
                        g.set(new Uint8Array(f), 0);
                        g.set(new Uint8Array(a), f.byteLength);
                        e = g
                    }
                } else goog.asserts.assert("temporary" ==
                    this.type_, "expected temporary session"), goog.asserts.assert(!b, "unexpected offline session ID"), e = new Uint8Array(a);
                goog.asserts.assert(e, "init data not set!")
            } catch (k) {
                return Promise.reject(k)
            }
            goog.asserts.assert(null == this.generatePromise_, "generatePromise_ should be null");
            this.generatePromise_ = new shaka.util.PublicPromise;
            d = shaka.polyfill.PatchedMediaKeysWebkit.prefixApi_;
            var h = d("generateKeyRequest");
            try {
                this.media_[h](this.keySystem_, e)
            } catch (k) {
                if ("InvalidStateError" != k.name) return this.generatePromise_ =
                    null, Promise.reject(k);
                (new shaka.util.Timer(function() {
                    try {
                        c.media_[h](c.keySystem_, e)
                    } catch (l) {
                        c.generatePromise_.reject(l), c.generatePromise_ = null
                    }
                })).tickAfter(.01)
            }
            return this.generatePromise_
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.update_ = function(a, b) {
            if (this.updatePromise_) this.updatePromise_.then(this.update_.bind(this, a, b))["catch"](this.update_.bind(this, a, b));
            else {
                this.updatePromise_ = a;
                if ("webkit-org.w3.clearkey" == this.keySystem_) {
                    var c = shaka.util.Uint8ArrayUtils;
                    var d = shaka.util.StringUtils.fromUTF8(b);
                    var e = JSON.parse(d);
                    "oct" != e.keys[0].kty && (this.updatePromise_.reject(Error("Response is not a valid JSON Web Key Set.")), this.updatePromise_ = null);
                    d = c.fromBase64(e.keys[0].k);
                    c = c.fromBase64(e.keys[0].kid)
                } else d = new Uint8Array(b), c = null;
                e = shaka.polyfill.PatchedMediaKeysWebkit.prefixApi_;
                e = e("addKey");
                try {
                    this.media_[e](this.keySystem_, d, c, this.sessionId)
                } catch (f) {
                    this.updatePromise_.reject(f), this.updatePromise_ = null
                }
            }
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.updateKeyStatus_ = function(a) {
            this.keyStatuses.setStatus(a);
            a = new shaka.util.FakeEvent("keystatuseschange");
            this.dispatchEvent(a)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.generateRequest = function(a, b) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession.generateRequest");
            return this.generate_(b, null)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.load = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession.load");
            return "persistent-license" == this.type_ ? this.generate_(null, a) : Promise.reject(Error("Not a persistent session."))
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.update = function(a) {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession.update", a);
            goog.asserts.assert(this.sessionId, "update without session ID");
            var b = new shaka.util.PublicPromise;
            this.update_(b, a);
            return b
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.close = function() {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession.close");
            if ("persistent-license" != this.type_) {
                if (!this.sessionId) return this.closed.reject(Error("The session is not callable.")), this.closed;
                var a = shaka.polyfill.PatchedMediaKeysWebkit.prefixApi_;
                a = a("cancelKeyRequest");
                try {
                    this.media_[a](this.keySystem_, this.sessionId)
                } catch (b) {}
            }
            this.closed.resolve();
            return this.closed
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeySession.prototype.remove = function() {
            shaka.log.debug("PatchedMediaKeysWebkit.MediaKeySession.remove");
            return "persistent-license" != this.type_ ? Promise.reject(Error("Not a persistent session.")) : this.close()
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap = function() {
            this.size = 0;
            this.status_ = void 0
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.prototype.setStatus = function(a) {
            this.size = void 0 == a ? 0 : 1;
            this.status_ = a
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.prototype.getStatus = function() {
            return this.status_
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.prototype.forEach = function(a) {
            this.status_ && a(this.status_, shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.KEY_ID_)
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.prototype.get = function(a) {
            if (this.has(a)) return this.status_
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.prototype.has = function(a) {
            var b = shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.KEY_ID_;
            return this.status_ && shaka.util.Uint8ArrayUtils.equal(new Uint8Array(a), new Uint8Array(b)) ? !0 : !1
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.prototype.entries = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for compiler.")
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.prototype.keys = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for compiler.")
        };
        shaka.polyfill.PatchedMediaKeysWebkit.MediaKeyStatusMap.prototype.values = function() {
            goog.asserts.assert(!1, "Not used!  Provided only for compiler.")
        };
        shaka.polyfill.register(shaka.polyfill.PatchedMediaKeysWebkit.install);
        shaka.polyfill.PiPWebkit = {};
        shaka.polyfill.PiPWebkit.install = function() {
            if (window.HTMLVideoElement) {
                var a = HTMLVideoElement.prototype;
                if ((!a.requestPictureInPicture || !document.exitPictureInPicture) && a.webkitSupportsPresentationMode) {
                    var b = shaka.polyfill.PiPWebkit;
                    shaka.log.debug("PiPWebkit.install");
                    document.pictureInPictureEnabled = !0;
                    document.pictureInPictureElement = null;
                    a.requestPictureInPicture = b.requestPictureInPicture_;
                    Object.defineProperty(a, "disablePictureInPicture", {
                        get: b.getDisablePictureInPicture_,
                        set: b.setDisablePictureInPicture_,
                        enumerable: !0,
                        configurable: !0
                    });
                    document.exitPictureInPicture = b.exitPictureInPicture_;
                    document.addEventListener("webkitpresentationmodechanged", b.proxyEvent_, !0)
                }
            }
        };
        shaka.polyfill.PiPWebkit.proxyEvent_ = function(a) {
            a = a.target;
            if (a.webkitPresentationMode == shaka.polyfill.PiPWebkit.PIP_MODE_) {
                document.pictureInPictureElement = a;
                var b = new Event("enterpictureinpicture");
                a.dispatchEvent(b)
            } else document.pictureInPictureElement == a && (document.pictureInPictureElement = null), b = new Event("leavepictureinpicture"), a.dispatchEvent(b)
        };
        shaka.polyfill.PiPWebkit.requestPictureInPicture_ = function() {
            var a = shaka.polyfill.PiPWebkit;
            return this.webkitSupportsPresentationMode(a.PIP_MODE_) ? (this.webkitSetPresentationMode(a.PIP_MODE_), document.pictureInPictureElement = this, Promise.resolve()) : Promise.reject(Error("PiP not allowed by video element"))
        };
        shaka.polyfill.PiPWebkit.exitPictureInPicture_ = function() {
            var a = shaka.polyfill.PiPWebkit,
                b = document.pictureInPictureElement;
            return b ? (b.webkitSetPresentationMode(a.INLINE_MODE_), document.pictureInPictureElement = null, Promise.resolve()) : Promise.reject(Error("No picture in picture element found"))
        };
        shaka.polyfill.PiPWebkit.getDisablePictureInPicture_ = function() {
            return this.hasAttribute("disablePictureInPicture") ? !0 : !this.webkitSupportsPresentationMode(shaka.polyfill.PiPWebkit.PIP_MODE_)
        };
        shaka.polyfill.PiPWebkit.setDisablePictureInPicture_ = function(a) {
            a ? this.setAttribute("disablePictureInPicture", "") : this.removeAttribute("disablePictureInPicture")
        };
        shaka.polyfill.PiPWebkit.PIP_MODE_ = "picture-in-picture";
        shaka.polyfill.PiPWebkit.INLINE_MODE_ = "inline";
        shaka.polyfill.register(shaka.polyfill.PiPWebkit.install);
        shaka.polyfill.VideoPlayPromise = {};
        shaka.polyfill.VideoPlayPromise.install = function() {
            shaka.log.debug("VideoPlayPromise.install");
            if (window.HTMLMediaElement) {
                var a = HTMLMediaElement.prototype.play;
                HTMLMediaElement.prototype.play = function() {
                    var b = a.apply(this);
                    b && b["catch"](function() {});
                    return b
                }
            }
        };
        shaka.polyfill.register(shaka.polyfill.VideoPlayPromise.install);
        shaka.polyfill.VideoPlaybackQuality = {};
        shaka.polyfill.VideoPlaybackQuality.install = function() {
            if (window.HTMLVideoElement) {
                var a = HTMLVideoElement.prototype;
                !a.getVideoPlaybackQuality && "webkitDroppedFrameCount" in a && (a.getVideoPlaybackQuality = shaka.polyfill.VideoPlaybackQuality.webkit_)
            }
        };
        shaka.polyfill.VideoPlaybackQuality.webkit_ = function() {
            return {
                droppedVideoFrames: this.webkitDroppedFrameCount,
                totalVideoFrames: this.webkitDecodedFrameCount,
                corruptedVideoFrames: 0,
                creationTime: NaN,
                totalFrameDelay: 0
            }
        };
        shaka.polyfill.register(shaka.polyfill.VideoPlaybackQuality.install);
        shaka.polyfill.VTTCue = {};
        shaka.polyfill.VTTCue.install = function() {
            if (window.VTTCue) shaka.log.info("Using native VTTCue.");
            else if (window.TextTrackCue) {
                var a = TextTrackCue.length;
                3 == a ? (shaka.log.info("Using VTTCue polyfill from 3 argument TextTrackCue."), window.VTTCue = shaka.polyfill.VTTCue.from3ArgsTextTrackCue_) : 6 == a ? (shaka.log.info("Using VTTCue polyfill from 6 argument TextTrackCue."), window.VTTCue = shaka.polyfill.VTTCue.from6ArgsTextTrackCue_) : shaka.polyfill.VTTCue.canUse3ArgsTextTrackCue_() && (shaka.log.info("Using VTTCue polyfill from 3 argument TextTrackCue."), window.VTTCue =
                    shaka.polyfill.VTTCue.from3ArgsTextTrackCue_)
            } else shaka.log.error("VTTCue not available.")
        };
        shaka.polyfill.VTTCue.from3ArgsTextTrackCue_ = function(a, b, c) {
            return new window.TextTrackCue(a, b, c)
        };
        shaka.polyfill.VTTCue.from6ArgsTextTrackCue_ = function(a, b, c) {
            return new window.TextTrackCue(a + "-" + b + "-" + c, a, b, c)
        };
        shaka.polyfill.VTTCue.canUse3ArgsTextTrackCue_ = function() {
            try {
                return !!shaka.polyfill.VTTCue.from3ArgsTextTrackCue_(1, 2, "")
            } catch (a) {
                return !1
            }
        };
        shaka.polyfill.register(shaka.polyfill.VTTCue.install);
        shaka.text.TtmlTextParser = function() {};
        goog.exportSymbol("shaka.text.TtmlTextParser", shaka.text.TtmlTextParser);
        shaka.text.TtmlTextParser.parameterNs_ = "http://www.w3.org/ns/ttml#parameter";
        shaka.text.TtmlTextParser.styleNs_ = "http://www.w3.org/ns/ttml#styling";
        shaka.text.TtmlTextParser.prototype.parseInit = function(a) {
            goog.asserts.assert(!1, "TTML does not have init segments")
        };
        goog.exportProperty(shaka.text.TtmlTextParser.prototype, "parseInit", shaka.text.TtmlTextParser.prototype.parseInit);
        shaka.text.TtmlTextParser.prototype.parseMedia = function(a, b) {
            var c = shaka.text.TtmlTextParser,
                d = shaka.util.XmlUtils,
                e = c.parameterNs_,
                f = c.styleNs_,
                g = shaka.util.StringUtils.fromUTF8(a),
                h = [],
                k = new DOMParser,
                l = null;
            if ("" == g) return h;
            try {
                l = k.parseFromString(g, "text/xml")
            } catch (t) {
                throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_XML, "Failed to parse TTML.");
            }
            if (l) {
                if (g = l.getElementsByTagName("parsererror")[0]) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL,
                    shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_XML, g.textContent);
                if (l = l.getElementsByTagName("tt")[0]) {
                    g = d.getAttributeNS(l, e, "frameRate");
                    k = d.getAttributeNS(l, e, "subFrameRate");
                    var m = d.getAttributeNS(l, e, "frameRateMultiplier");
                    e = d.getAttributeNS(l, e, "tickRate");
                    var n = l.getAttribute("xml:space") || "default";
                    f = d.getAttributeNS(l, f, "extent")
                } else throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_XML, "TTML does not contain <tt> tag.");
                if ("default" != n && "preserve" != n) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_XML, "Invalid xml:space value: " + n);
                d = "default" == n;
                e = new c.RateInfo_(g, k, m, e);
                g = c.getLeafNodes_(l.getElementsByTagName("metadata")[0]);
                k = c.getLeafNodes_(l.getElementsByTagName("styling")[0]);
                m = c.getLeafNodes_(l.getElementsByTagName("layout")[0]);
                n = [];
                for (var q = 0; q < m.length; q++) {
                    var p = c.parseCueRegion_(m[q], k, f);
                    p && n.push(p)
                }
                l = c.getLeafCues_(l.getElementsByTagName("body")[0]);
                l = $jscomp.makeIterator(l);
                for (f = l.next(); !f.done; f = l.next())(f = c.parseCue_(f.value, b.periodStart, e, g, k, m, n, d, !1)) && h.push(f)
            }
            return h
        };
        goog.exportProperty(shaka.text.TtmlTextParser.prototype, "parseMedia", shaka.text.TtmlTextParser.prototype.parseMedia);
        shaka.text.TtmlTextParser.percentValues_ = /^(\d{1,2}(?:\.\d+)?|100(?:\.0+)?)% (\d{1,2}(?:\.\d+)?|100(?:\.0+)?)%$/;
        shaka.text.TtmlTextParser.unitValues_ = /^(\d+px|\d+em)$/;
        shaka.text.TtmlTextParser.pixelValues_ = /^(\d+)px (\d+)px$/;
        shaka.text.TtmlTextParser.timeColonFormatFrames_ = /^(\d{2,}):(\d{2}):(\d{2}):(\d{2})\.?(\d+)?$/;
        shaka.text.TtmlTextParser.timeColonFormat_ = /^(?:(\d{2,}):)?(\d{2}):(\d{2})$/;
        shaka.text.TtmlTextParser.timeColonFormatMilliseconds_ = /^(?:(\d{2,}):)?(\d{2}):(\d{2}\.\d{2,})$/;
        shaka.text.TtmlTextParser.timeFramesFormat_ = /^(\d*(?:\.\d*)?)f$/;
        shaka.text.TtmlTextParser.timeTickFormat_ = /^(\d*(?:\.\d*)?)t$/;
        shaka.text.TtmlTextParser.timeHMSFormat_ = /^(?:(\d*(?:\.\d*)?)h)?(?:(\d*(?:\.\d*)?)m)?(?:(\d*(?:\.\d*)?)s)?(?:(\d*(?:\.\d*)?)ms)?$/;
        shaka.text.TtmlTextParser.textAlignToLineAlign_ = {
            left: shaka.text.Cue.lineAlign.START,
            center: shaka.text.Cue.lineAlign.CENTER,
            right: shaka.text.Cue.lineAlign.END,
            start: shaka.text.Cue.lineAlign.START,
            end: shaka.text.Cue.lineAlign.END
        };
        shaka.text.TtmlTextParser.textAlignToPositionAlign_ = {
            left: shaka.text.Cue.positionAlign.LEFT,
            center: shaka.text.Cue.positionAlign.CENTER,
            right: shaka.text.Cue.positionAlign.RIGHT
        };
        shaka.text.TtmlTextParser.getLeafNodes_ = function(a) {
            var b = [];
            if (!a) return b;
            for (var c = $jscomp.makeIterator(a.childNodes), d = c.next(); !d.done; d = c.next()) d = d.value, d.nodeType == Node.ELEMENT_NODE && "br" !== d.nodeName && (goog.asserts.assert(d instanceof Element, "Node should be Element!"), d = shaka.text.TtmlTextParser.getLeafNodes_(d), goog.asserts.assert(0 < d.length, "Only a null Element should return no leaves!"), b = b.concat(d));
            b.length || b.push(a);
            return b
        };
        shaka.text.TtmlTextParser.getLeafCues_ = function(a) {
            if (!a) return [];
            var b = [];
            a = $jscomp.makeIterator(a.childNodes);
            for (var c = a.next(); !c.done; c = a.next()) c = c.value, c instanceof Element && (c.hasAttribute("begin") ? b.push(c) : b = b.concat(shaka.text.TtmlTextParser.getLeafCues_(c)));
            return b
        };
        shaka.text.TtmlTextParser.sanitizeTextContent = function(a, b) {
            for (var c = "", d = $jscomp.makeIterator(a.childNodes), e = d.next(); !e.done; e = d.next()) e = e.value, "br" == e.nodeName && a.childNodes[0] !== e ? c += "\n" : e.childNodes && 0 < e.childNodes.length ? c += shaka.text.TtmlTextParser.sanitizeTextContent(e, b) : b ? (e = e.textContent.trim(), e = e.replace(/\s+/g, " "), c += e) : c += e.textContent;
            return c
        };
        shaka.text.TtmlTextParser.parseCue_ = function(a, b, c, d, e, f, g, h, k) {
            if (k && "br" == a.nodeName) return a = new shaka.text.Cue(0, 0, ""), a.spacer = !0, a;
            var l = /^[\s\n]*$/.test(a.textContent),
                m = a.nodeType == Node.ELEMENT_NODE && !a.hasAttribute("begin") && !a.hasAttribute("end");
            if (a.nodeType != Node.ELEMENT_NODE || m && l || m && !k) return null;
            l = shaka.text.TtmlTextParser.parseTime_(a.getAttribute("begin"), c);
            m = shaka.text.TtmlTextParser.parseTime_(a.getAttribute("end"), c);
            var n = shaka.text.TtmlTextParser.parseTime_(a.getAttribute("dur"),
                c);
            null == m && null != n && (m = l + n);
            if (!k && (null == l || null == m)) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_TEXT_CUE);
            l = k && null == l ? 0 : l + b;
            m = k && null == m ? 0 : m + b;
            n = "";
            k = [];
            if (Array.from(a.childNodes).find(function(a) {
                    return a.nodeType === Node.TEXT_NODE && /\S+/.test(a.textContent)
                })) n = shaka.text.TtmlTextParser.sanitizeTextContent(a, h);
            else
                for (var q = $jscomp.makeIterator(a.childNodes), p = q.next(); !p.done; p = q.next())
                    if (p = shaka.text.TtmlTextParser.parseCue_(p.value,
                            b, c, d, e, f, g, h, !0)) p.startTime = p.startTime || l, p.endTime = p.endTime || m, k.push(p);
            b = new shaka.text.Cue(l, m, n);
            b.nestedCues = k;
            if ((f = shaka.text.TtmlTextParser.getElementsFromCollection_(a, "region", f, "")[0]) && f.getAttribute("xml:id")) {
                var t = f.getAttribute("xml:id");
                b.region = g.filter(function(a) {
                    return a.id == t
                })[0]
            }
            d = shaka.text.TtmlTextParser.getElementsFromCollection_(a, "backgroundImage", d, "#", shaka.text.TtmlTextParser.smpteNs_)[0];
            shaka.text.TtmlTextParser.addStyle_(b, a, f, d, e);
            return b
        };
        shaka.text.TtmlTextParser.parseCueRegion_ = function(a, b, c) {
            var d = shaka.text.TtmlTextParser,
                e = new shaka.text.CueRegion,
                f = a.getAttribute("xml:id");
            if (!f) return shaka.log.warning("TtmlTextParser parser encountered a region with no id. Region will be ignored."), null;
            e.id = f;
            f = null;
            c && (f = d.percentValues_.exec(c) || d.pixelValues_.exec(c));
            c = f ? Number(f[1]) : null;
            f = f ? Number(f[2]) : null;
            var g, h;
            if (g = d.getStyleAttributeFromRegion_(a, b, "extent")) g = (h = d.percentValues_.exec(g)) || d.pixelValues_.exec(g), null != g && (e.width =
                null != c ? 100 * Number(g[1]) / c : Number(g[1]), e.height = null != f ? 100 * Number(g[2]) / f : Number(g[2]), e.widthUnits = h || null != c ? shaka.text.CueRegion.units.PERCENTAGE : shaka.text.CueRegion.units.PX, e.heightUnits = h || null != f ? shaka.text.CueRegion.units.PERCENTAGE : shaka.text.CueRegion.units.PX);
            if (a = d.getStyleAttributeFromRegion_(a, b, "origin")) g = (h = d.percentValues_.exec(a)) || d.pixelValues_.exec(a), null != g && (e.viewportAnchorX = null != c ? 100 * Number(g[1]) / c : Number(g[1]), e.viewportAnchorY = null != f ? 100 * Number(g[2]) / f : Number(g[2]),
                e.viewportAnchorUnits = h || null != c ? shaka.text.CueRegion.units.PERCENTAGE : shaka.text.CueRegion.units.PX);
            return e
        };
        shaka.text.TtmlTextParser.addStyle_ = function(a, b, c, d, e) {
            var f = shaka.text.TtmlTextParser,
                g = shaka.text.Cue;
            "rtl" == f.getStyleAttribute_(b, c, e, "direction") && (a.direction = g.direction.HORIZONTAL_RIGHT_TO_LEFT);
            var h = f.getStyleAttribute_(b, c, e, "writingMode");
            "tb" == h || "tblr" == h ? a.writingMode = g.writingMode.VERTICAL_LEFT_TO_RIGHT : "tbrl" == h ? a.writingMode = g.writingMode.VERTICAL_RIGHT_TO_LEFT : "rltb" == h || "rl" == h ? a.direction = g.direction.HORIZONTAL_RIGHT_TO_LEFT : h && (a.direction = g.direction.HORIZONTAL_LEFT_TO_RIGHT);
            (h = f.getStyleAttribute_(b, c, e, "textAlign")) ? (a.positionAlign = f.textAlignToPositionAlign_[h], a.lineAlign = f.textAlignToLineAlign_[h], goog.asserts.assert(h.toUpperCase() in g.textAlign, h.toUpperCase() + " Should be in Cue.textAlign values!"), a.textAlign = g.textAlign[h.toUpperCase()]) : a.textAlign = g.textAlign.START;
            if (h = f.getStyleAttribute_(b, c, e, "displayAlign")) goog.asserts.assert(h.toUpperCase() in g.displayAlign, h.toUpperCase() + " Should be in Cue.displayAlign values!"), a.displayAlign = g.displayAlign[h.toUpperCase()];
            if (h = f.getStyleAttribute_(b, c, e, "color")) a.color = h;
            if (h = f.getStyleAttribute_(b, c, e, "backgroundColor")) a.backgroundColor = h;
            if (h = f.getStyleAttribute_(b, c, e, "fontFamily")) a.fontFamily = h;
            (h = f.getStyleAttribute_(b, c, e, "fontWeight")) && "bold" == h && (a.fontWeight = g.fontWeight.BOLD);
            (h = f.getStyleAttribute_(b, c, e, "wrapOption")) && "noWrap" == h && (a.wrapLine = !1);
            (h = f.getStyleAttribute_(b, c, e, "lineHeight")) && h.match(f.unitValues_) && (a.lineHeight = h);
            (h = f.getStyleAttribute_(b, c, e, "fontSize")) && h.match(f.unitValues_) &&
                (a.fontSize = h);
            if (h = f.getStyleAttribute_(b, c, e, "fontStyle")) goog.asserts.assert(h.toUpperCase() in g.fontStyle, h.toUpperCase() + " Should be in Cue.fontStyle values!"), a.fontStyle = g.fontStyle[h.toUpperCase()];
            d && (g = d.getAttribute("imagetype"), h = d.getAttribute("encoding"), d = d.textContent.trim(), "PNG" == g && "Base64" == h && d && (a.backgroundImage = "data:image/png;base64," + d));
            (c = f.getStyleAttributeFromRegion_(c, e, "textDecoration")) && f.addTextDecoration_(a, c);
            (b = f.getStyleAttributeFromElement_(b, e, "textDecoration")) &&
            f.addTextDecoration_(a, b)
        };
        shaka.text.TtmlTextParser.addTextDecoration_ = function(a, b) {
            for (var c = shaka.text.Cue, d = b.split(" "), e = 0; e < d.length; e++) switch (d[e]) {
                case "underline":
                    a.textDecoration.includes(c.textDecoration.UNDERLINE) || a.textDecoration.push(c.textDecoration.UNDERLINE);
                    break;
                case "noUnderline":
                    a.textDecoration.includes(c.textDecoration.UNDERLINE) && shaka.util.ArrayUtils.remove(a.textDecoration, c.textDecoration.UNDERLINE);
                    break;
                case "lineThrough":
                    a.textDecoration.includes(c.textDecoration.LINE_THROUGH) || a.textDecoration.push(c.textDecoration.LINE_THROUGH);
                    break;
                case "noLineThrough":
                    a.textDecoration.includes(c.textDecoration.LINE_THROUGH) && shaka.util.ArrayUtils.remove(a.textDecoration, c.textDecoration.LINE_THROUGH);
                    break;
                case "overline":
                    a.textDecoration.includes(c.textDecoration.OVERLINE) || a.textDecoration.push(c.textDecoration.OVERLINE);
                    break;
                case "noOverline":
                    a.textDecoration.includes(c.textDecoration.OVERLINE) && shaka.util.ArrayUtils.remove(a.textDecoration, c.textDecoration.OVERLINE)
            }
        };
        shaka.text.TtmlTextParser.getStyleAttribute_ = function(a, b, c, d) {
            var e = shaka.text.TtmlTextParser;
            return (a = e.getStyleAttributeFromElement_(a, c, d)) ? a : e.getStyleAttributeFromRegion_(b, c, d)
        };
        shaka.text.TtmlTextParser.getStyleAttributeFromRegion_ = function(a, b, c) {
            var d = shaka.util.XmlUtils,
                e = shaka.text.TtmlTextParser.styleNs_;
            if (!a) return null;
            for (var f = shaka.text.TtmlTextParser.getLeafNodes_(a), g = 0; g < f.length; g++) {
                var h = d.getAttributeNS(f[g], e, c);
                if (h) return h
            }
            return shaka.text.TtmlTextParser.getInheritedStyleAttribute_(a, b, c)
        };
        shaka.text.TtmlTextParser.getStyleAttributeFromElement_ = function(a, b, c) {
            var d = shaka.util.XmlUtils.getAttributeNS(a, shaka.text.TtmlTextParser.styleNs_, c);
            return d ? d : shaka.text.TtmlTextParser.getInheritedStyleAttribute_(a, b, c)
        };
        shaka.text.TtmlTextParser.getInheritedStyleAttribute_ = function(a, b, c) {
            var d = shaka.util.XmlUtils,
                e = shaka.text.TtmlTextParser.styleNs_;
            a = shaka.text.TtmlTextParser.getElementsFromCollection_(a, "style", b, "");
            for (var f = null, g = 0; g < a.length; g++) {
                var h = d.getAttributeNS(a[g], e, c);
                h || (h = shaka.text.TtmlTextParser.getStyleAttributeFromElement_(a[g], b, c));
                h && (f = h)
            }
            return f
        };
        shaka.text.TtmlTextParser.getElementsFromCollection_ = function(a, b, c, d, e) {
            var f = [];
            if (!a || 1 > c.length) return f;
            if (a = shaka.text.TtmlTextParser.getInheritedAttribute_(a, b, e))
                for (a = a.split(" "), a = $jscomp.makeIterator(a), b = a.next(); !b.done; b = a.next()) {
                    b = b.value;
                    e = $jscomp.makeIterator(c);
                    for (var g = e.next(); !g.done; g = e.next())
                        if (g = g.value, d + g.getAttribute("xml:id") == b) {
                            f.push(g);
                            break
                        }
                }
            return f
        };
        shaka.text.TtmlTextParser.getInheritedAttribute_ = function(a, b, c) {
            for (var d = null, e = shaka.util.XmlUtils; a && !(d = c ? e.getAttributeNS(a, c, b) : a.getAttribute(b)) && (a = a.parentNode, a instanceof Element););
            return d
        };
        shaka.text.TtmlTextParser.parseTime_ = function(a, b) {
            var c = null,
                d = shaka.text.TtmlTextParser;
            d.timeColonFormatFrames_.test(a) ? c = d.parseColonTimeWithFrames_(b, a) : d.timeColonFormat_.test(a) ? c = d.parseTimeFromRegex_(d.timeColonFormat_, a) : d.timeColonFormatMilliseconds_.test(a) ? c = d.parseTimeFromRegex_(d.timeColonFormatMilliseconds_, a) : d.timeFramesFormat_.test(a) ? c = d.parseFramesTime_(b, a) : d.timeTickFormat_.test(a) ? c = d.parseTickTime_(b, a) : d.timeHMSFormat_.test(a) && (c = d.parseTimeFromRegex_(d.timeHMSFormat_, a));
            return c
        };
        shaka.text.TtmlTextParser.parseFramesTime_ = function(a, b) {
            var c = shaka.text.TtmlTextParser.timeFramesFormat_.exec(b);
            return Number(c[1]) / a.frameRate
        };
        shaka.text.TtmlTextParser.parseTickTime_ = function(a, b) {
            var c = shaka.text.TtmlTextParser.timeTickFormat_.exec(b);
            return Number(c[1]) / a.tickRate
        };
        shaka.text.TtmlTextParser.parseColonTimeWithFrames_ = function(a, b) {
            var c = shaka.text.TtmlTextParser.timeColonFormatFrames_.exec(b),
                d = Number(c[1]),
                e = Number(c[2]),
                f = Number(c[3]),
                g = Number(c[4]);
            g += (Number(c[5]) || 0) / a.subFrameRate;
            f += g / a.frameRate;
            return f + 60 * e + 3600 * d
        };
        shaka.text.TtmlTextParser.parseTimeFromRegex_ = function(a, b) {
            var c = a.exec(b);
            return null == c || "" == c[0] ? null : (Number(c[4]) || 0) / 1E3 + (Number(c[3]) || 0) + 60 * (Number(c[2]) || 0) + 3600 * (Number(c[1]) || 0)
        };
        shaka.text.TtmlTextParser.RateInfo_ = function(a, b, c, d) {
            this.frameRate = Number(a) || 30;
            this.subFrameRate = Number(b) || 1;
            this.tickRate = Number(d);
            0 == this.tickRate && (this.tickRate = a ? this.frameRate * this.subFrameRate : 1);
            c && (a = /^(\d+) (\d+)$/g.exec(c)) && (this.frameRate *= Number(a[1]) / Number(a[2]))
        };
        shaka.text.TtmlTextParser.smpteNs_ = "http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt";
        shaka.text.TextEngine.registerParser("application/ttml+xml", shaka.text.TtmlTextParser);
        shaka.text.Mp4TtmlParser = function() {
            this.parser_ = new shaka.text.TtmlTextParser
        };
        goog.exportSymbol("shaka.text.Mp4TtmlParser", shaka.text.Mp4TtmlParser);
        shaka.text.Mp4TtmlParser.prototype.parseInit = function(a) {
            var b = shaka.util.Mp4Parser,
                c = !1;
            (new b).box("moov", b.children).box("trak", b.children).box("mdia", b.children).box("minf", b.children).box("stbl", b.children).fullBox("stsd", b.sampleDescription).box("stpp", function(a) {
                c = !0;
                a.parser.stop()
            }).parse(a);
            if (!c) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_MP4_TTML);
        };
        goog.exportProperty(shaka.text.Mp4TtmlParser.prototype, "parseInit", shaka.text.Mp4TtmlParser.prototype.parseInit);
        shaka.text.Mp4TtmlParser.prototype.parseMedia = function(a, b) {
            var c = shaka.util.Mp4Parser,
                d = !1,
                e = [];
            (new c).box("mdat", c.allData(function(a) {
                d = !0;
                e = e.concat(this.parser_.parseMedia(a, b))
            }.bind(this))).parse(a);
            if (!d) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_MP4_TTML);
            return e
        };
        goog.exportProperty(shaka.text.Mp4TtmlParser.prototype, "parseMedia", shaka.text.Mp4TtmlParser.prototype.parseMedia);
        shaka.text.TextEngine.registerParser('application/mp4; codecs="stpp"', shaka.text.Mp4TtmlParser);
        shaka.text.TextEngine.registerParser('application/mp4; codecs="stpp.ttml.im1t"', shaka.text.Mp4TtmlParser);
        shaka.text.TextEngine.registerParser('application/mp4; codecs="stpp.TTML.im1t"', shaka.text.Mp4TtmlParser);
        shaka.text.VttTextParser = function() {};
        goog.exportSymbol("shaka.text.VttTextParser", shaka.text.VttTextParser);
        shaka.text.VttTextParser.prototype.parseInit = function(a) {
            goog.asserts.assert(!1, "VTT does not have init segments")
        };
        goog.exportProperty(shaka.text.VttTextParser.prototype, "parseInit", shaka.text.VttTextParser.prototype.parseInit);
        shaka.text.VttTextParser.prototype.parseMedia = function(a, b) {
            var c = shaka.text.VttTextParser,
                d = shaka.util.StringUtils.fromUTF8(a);
            d = d.replace(/\r\n|\r(?=[^\n]|$)/gm, "\n");
            d = d.split(/\n{2,}/m);
            if (!/^WEBVTT($|[ \t\n])/m.test(d[0])) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_TEXT_HEADER);
            var e = b.segmentStart;
            if (null == e && (e = 0, d[0].includes("X-TIMESTAMP-MAP"))) {
                var f = d[0].match(/LOCAL:((?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{3}))/m),
                    g = d[0].match(/MPEGTS:(\d+)/m);
                if (f && g) {
                    e = new shaka.util.TextParser(f[1]);
                    e = shaka.text.VttTextParser.parseTime_(e);
                    if (null == e) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_TEXT_HEADER);
                    e = b.periodStart + (Number(g[1]) / shaka.text.VttTextParser.MPEG_TIMESCALE_ - e)
                }
            }
            g = [];
            f = d[0].split("\n");
            for (var h = 1; h < f.length; h++)
                if (/^Region:/.test(f[h])) {
                    var k = c.parseRegion_(f[h]);
                    g.push(k)
                } h = [];
            for (k = 1; k < d.length; k++) f = d[k].split("\n"), (f = c.parseCue_(f,
                e, g)) && h.push(f);
            return h
        };
        goog.exportProperty(shaka.text.VttTextParser.prototype, "parseMedia", shaka.text.VttTextParser.prototype.parseMedia);
        shaka.text.VttTextParser.parseRegion_ = function(a) {
            var b = shaka.text.VttTextParser;
            a = new shaka.util.TextParser(a);
            var c = new shaka.text.CueRegion;
            a.readWord();
            a.skipWhitespace();
            for (var d = a.readWord(); d;) b.parseRegionSetting_(c, d) || shaka.log.warning("VTT parser encountered an invalid VTTRegion setting: ", d, " The setting will be ignored."), a.skipWhitespace(), d = a.readWord();
            return c
        };
        shaka.text.VttTextParser.parseCue_ = function(a, b, c) {
            var d = shaka.text.VttTextParser;
            if (1 == a.length && !a[0] || /^NOTE($|[ \t])/.test(a[0]) || "STYLE" == a[0]) return null;
            var e = null;
            a[0].includes("--\x3e") || (e = a[0], a.splice(0, 1));
            var f = new shaka.util.TextParser(a[0]),
                g = d.parseTime_(f),
                h = f.readRegex(/[ \t]+--\x3e[ \t]+/g),
                k = d.parseTime_(f);
            if (null == g || null == h || null == k) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_TEXT_CUE);
            g += b;
            k += b;
            a = a.slice(1).join("\n").trim();
            g = new shaka.text.Cue(g, k, a);
            f.skipWhitespace();
            for (k = f.readWord(); k;) d.parseCueSetting(g, k, c) || shaka.log.warning("VTT parser encountered an invalid VTT setting: ", k, " The setting will be ignored."), f.skipWhitespace(), k = f.readWord();
            null != e && (g.id = e);
            return g
        };
        shaka.text.VttTextParser.parseCueSetting = function(a, b, c) {
            var d = shaka.text.VttTextParser,
                e;
            if (e = /^align:(start|middle|center|end|left|right)$/.exec(b)) d.setTextAlign_(a, e[1]);
            else if (e = /^vertical:(lr|rl)$/.exec(b)) d.setVerticalWritingMode_(a, e[1]);
            else if (e = /^size:([\d.]+)%$/.exec(b)) a.size = Number(e[1]);
            else if (e = /^position:([\d.]+)%(?:,(line-left|line-right|center|start|end))?$/.exec(b)) a.position = Number(e[1]), e[2] && d.setPositionAlign_(a, e[2]);
            else if (e = /^region:(.*)$/.exec(b)) {
                if (b = d.getRegionById_(c,
                        e[1])) a.region = b
            } else return d.parsedLineValueAndInterpretation_(a, b);
            return !0
        };
        shaka.text.VttTextParser.getRegionById_ = function(a, b) {
            var c = a.filter(function(a) {
                return a.id == b
            });
            if (!c.length) return shaka.log.warning("VTT parser could not find a region with id: ", b, " The region will be ignored."), null;
            goog.asserts.assert(1 == c.length, "VTTRegion ids should be unique!");
            return c[0]
        };
        shaka.text.VttTextParser.parseRegionSetting_ = function(a, b) {
            var c;
            if (c = /^id=(.*)$/.exec(b)) a.id = c[1];
            else if (c = /^width=(\d{1,2}|100)%$/.exec(b)) a.width = Number(c[1]);
            else if (c = /^lines=(\d+)$/.exec(b)) a.height = Number(c[1]), a.heightUnits = shaka.text.CueRegion.units.LINES;
            else if (c = /^regionanchor=(\d{1,2}|100)%,(\d{1,2}|100)%$/.exec(b)) a.regionAnchorX = Number(c[1]), a.regionAnchorY = Number(c[2]);
            else if (c = /^viewportanchor=(\d{1,2}|100)%,(\d{1,2}|100)%$/.exec(b)) a.viewportAnchorX = Number(c[1]), a.viewportAnchorY =
                Number(c[2]);
            else if (/^scroll=up$/.exec(b)) a.scroll = shaka.text.CueRegion.scrollMode.UP;
            else return !1;
            return !0
        };
        shaka.text.VttTextParser.setTextAlign_ = function(a, b) {
            var c = shaka.text.Cue;
            "middle" == b ? a.textAlign = c.textAlign.CENTER : (goog.asserts.assert(b.toUpperCase() in c.textAlign, b.toUpperCase() + " Should be in Cue.textAlign values!"), a.textAlign = c.textAlign[b.toUpperCase()])
        };
        shaka.text.VttTextParser.setPositionAlign_ = function(a, b) {
            var c = shaka.text.Cue;
            a.positionAlign = "line-left" == b || "start" == b ? c.positionAlign.LEFT : "line-right" == b || "end" == b ? c.positionAlign.RIGHT : c.positionAlign.CENTER
        };
        shaka.text.VttTextParser.setVerticalWritingMode_ = function(a, b) {
            var c = shaka.text.Cue;
            a.writingMode = "lr" == b ? c.writingMode.VERTICAL_LEFT_TO_RIGHT : c.writingMode.VERTICAL_RIGHT_TO_LEFT
        };
        shaka.text.VttTextParser.parsedLineValueAndInterpretation_ = function(a, b) {
            var c = shaka.text.Cue,
                d;
            if (d = /^line:([\d.]+)%(?:,(start|end|center))?$/.exec(b)) a.lineInterpretation = c.lineInterpretation.PERCENTAGE, a.line = Number(d[1]), d[2] && (goog.asserts.assert(d[2].toUpperCase() in c.lineAlign, d[2].toUpperCase() + " Should be in Cue.lineAlign values!"), a.lineAlign = c.lineAlign[d[2].toUpperCase()]);
            else if (d = /^line:(-?\d+)(?:,(start|end|center))?$/.exec(b)) a.lineInterpretation = c.lineInterpretation.LINE_NUMBER,
                a.line = Number(d[1]), d[2] && (goog.asserts.assert(d[2].toUpperCase() in c.lineAlign, d[2].toUpperCase() + " Should be in Cue.lineAlign values!"), a.lineAlign = c.lineAlign[d[2].toUpperCase()]);
            else return !1;
            return !0
        };
        shaka.text.VttTextParser.parseTime_ = function(a) {
            a = a.readRegex(/(?:(\d{1,}):)?(\d{2}):(\d{2})\.(\d{3})/g);
            if (null == a) return null;
            var b = Number(a[2]),
                c = Number(a[3]);
            return 59 < b || 59 < c ? null : Number(a[4]) / 1E3 + c + 60 * b + 3600 * (Number(a[1]) || 0)
        };
        shaka.text.VttTextParser.MPEG_TIMESCALE_ = 9E4;
        shaka.text.TextEngine.registerParser("text/vtt", shaka.text.VttTextParser);
        shaka.text.TextEngine.registerParser('text/vtt; codecs="vtt"', shaka.text.VttTextParser);
        shaka.text.TextEngine.registerParser('text/vtt; codecs="wvtt"', shaka.text.VttTextParser);
        shaka.text.Mp4VttParser = function() {
            this.timescale_ = null
        };
        goog.exportSymbol("shaka.text.Mp4VttParser", shaka.text.Mp4VttParser);
        shaka.text.Mp4VttParser.prototype.parseInit = function(a) {
            var b = shaka.util.Mp4Parser,
                c = !1;
            (new b).box("moov", b.children).box("trak", b.children).box("mdia", b.children).fullBox("mdhd", function(a) {
                goog.asserts.assert(0 == a.version || 1 == a.version, "MDHD version can only be 0 or 1");
                0 == a.version ? (a.reader.skip(4), a.reader.skip(4), this.timescale_ = a.reader.readUint32(), a.reader.skip(4)) : (a.reader.skip(8), a.reader.skip(8), this.timescale_ = a.reader.readUint32(), a.reader.skip(8));
                a.reader.skip(4)
            }.bind(this)).box("minf",
                b.children).box("stbl", b.children).fullBox("stsd", b.sampleDescription).box("wvtt", function(a) {
                c = !0
            }).parse(a);
            if (!this.timescale_) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_MP4_VTT);
            if (!c) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_MP4_VTT);
        };
        goog.exportProperty(shaka.text.Mp4VttParser.prototype, "parseInit", shaka.text.Mp4VttParser.prototype.parseInit);
        shaka.text.Mp4VttParser.prototype.parseMedia = function(a, b) {
            var c = this;
            if (!this.timescale_) throw shaka.log.error("No init segment for MP4+VTT!"), new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_MP4_VTT);
            var d = shaka.text.Mp4VttParser,
                e = shaka.util.Mp4Parser,
                f = 0,
                g = [],
                h, k = [],
                l = !1,
                m = !1,
                n = !1,
                q = null;
            (new e).box("moof", e.children).box("traf", e.children).fullBox("tfdt", function(a) {
                l = !0;
                goog.asserts.assert(0 == a.version || 1 == a.version, "TFDT version can only be 0 or 1");
                f = 0 == a.version ? a.reader.readUint32() : a.reader.readUint64()
            }).fullBox("tfhd", function(a) {
                goog.asserts.assert(null != a.flags, "A TFHD box should have a valid flags value");
                q = d.parseTFHD_(a.flags, a.reader)
            }).fullBox("trun", function(a) {
                m = !0;
                goog.asserts.assert(null != a.version, "A TRUN box should have a valid version value");
                goog.asserts.assert(null != a.flags, "A TRUN box should have a valid flags value");
                g = d.parseTRUN_(a.version, a.flags, a.reader)
            }).box("mdat", e.allData(function(a) {
                goog.asserts.assert(!n, "VTT cues in mp4 with multiple MDAT are not currently supported!");
                n = !0;
                h = a
            })).parse(a);
            if (!n && !l && !m) throw new shaka.util.Error(shaka.util.Error.Severity.CRITICAL, shaka.util.Error.Category.TEXT, shaka.util.Error.Code.INVALID_MP4_VTT);
            var p = f;
            e = new DataView(h.buffer, h.byteOffset, h.byteLength);
            var t = new shaka.util.DataViewReader(e, shaka.util.DataViewReader.Endianness.BIG_ENDIAN);
            g.forEach(function(a) {
                var d = a.duration || q,
                    e = a.timeOffset ? f + a.timeOffset : p;
                p = e + (d || 0);
                var g = 0;
                do {
                    var h = t.readUint32();
                    g += h;
                    var l = t.readUint32();
                    l = shaka.util.Mp4Parser.typeToString(l);
                    var m =
                        null;
                    "vttc" == l ? 8 < h && (m = t.readBytes(h - 8)) : ("vtte" != l && shaka.log.error("Unknown box " + l + "! Skipping!"), t.skip(h - 8));
                    d ? m && (goog.asserts.assert(null != c.timescale_, "Timescale should not be null!"), k.push(shaka.text.Mp4VttParser.parseVTTC_(m, b.periodStart + e / c.timescale_, b.periodStart + p / c.timescale_))) : shaka.log.error("WVTT sample duration unknown, and no default found!");
                    goog.asserts.assert(!a.sampleSize || g <= a.sampleSize, "The samples do not fit evenly into the sample sizes given in the TRUN box!")
                } while (a.sampleSize &&
                    g < a.sampleSize)
            });
            goog.asserts.assert(!t.hasMoreData(), "MDAT which contain VTT cues and non-VTT data are not currently supported!");
            return k.filter(shaka.util.Functional.isNotNull)
        };
        goog.exportProperty(shaka.text.Mp4VttParser.prototype, "parseMedia", shaka.text.Mp4VttParser.prototype.parseMedia);
        shaka.text.Mp4VttParser.parseTFHD_ = function(a, b) {
            b.skip(4);
            a & 1 && b.skip(8);
            a & 2 && b.skip(4);
            return a & 8 ? b.readUint32() : null
        };
        shaka.text.Mp4VttParser.parseTRUN_ = function(a, b, c) {
            var d = c.readUint32();
            b & 1 && c.skip(4);
            b & 4 && c.skip(4);
            for (var e = [], f = 0; f < d; f++) {
                var g = {
                    duration: null,
                    sampleSize: null,
                    timeOffset: null
                };
                b & 256 && (g.duration = c.readUint32());
                b & 512 && (g.sampleSize = c.readUint32());
                b & 1024 && c.skip(4);
                b & 2048 && (g.timeOffset = 0 == a ? c.readUint32() : c.readInt32());
                e.push(g)
            }
            return e
        };
        shaka.text.Mp4VttParser.parseVTTC_ = function(a, b, c) {
            var d, e, f;
            (new shaka.util.Mp4Parser).box("payl", shaka.util.Mp4Parser.allData(function(a) {
                d = shaka.util.StringUtils.fromUTF8(a)
            })).box("iden", shaka.util.Mp4Parser.allData(function(a) {
                e = shaka.util.StringUtils.fromUTF8(a)
            })).box("sttg", shaka.util.Mp4Parser.allData(function(a) {
                f = shaka.util.StringUtils.fromUTF8(a)
            })).parse(a);
            return d ? shaka.text.Mp4VttParser.assembleCue_(d, e, f, b, c) : null
        };
        shaka.text.Mp4VttParser.assembleCue_ = function(a, b, c, d, e) {
            a = new shaka.text.Cue(d, e, a);
            b && (a.id = b);
            if (c)
                for (b = new shaka.util.TextParser(c), c = b.readWord(); c;) shaka.text.VttTextParser.parseCueSetting(a, c, []) || shaka.log.warning("VTT parser encountered an invalid VTT setting: ", c, " The setting will be ignored."), b.skipWhitespace(), c = b.readWord();
            return a
        };
        shaka.text.TextEngine.registerParser('application/mp4; codecs="wvtt"', shaka.text.Mp4VttParser);
        shaka.util.Dom = function() {};
        shaka.util.Dom.createHTMLElement = function(a) {
            return document.createElement(a)
        };
        goog.exportSymbol("shaka.util.Dom.createHTMLElement", shaka.util.Dom.createHTMLElement);
        shaka.util.Dom.createVideoElement = function() {
            var a = document.createElement("video");
            a.muted = !0;
            a.width = 600;
            a.height = 400;
            return a
        };
        goog.exportSymbol("shaka.util.Dom.createVideoElement", shaka.util.Dom.createVideoElement);
        shaka.util.Dom.asHTMLElement = function(a) {
            return a
        };
        goog.exportSymbol("shaka.util.Dom.asHTMLElement", shaka.util.Dom.asHTMLElement);
        shaka.util.Dom.asHTMLMediaElement = function(a) {
            return a
        };
        goog.exportSymbol("shaka.util.Dom.asHTMLMediaElement", shaka.util.Dom.asHTMLMediaElement);
        shaka.util.Dom.getElementByClassName = function(a, b) {
            var c = b.getElementsByClassName(a);
            goog.asserts.assert(1 == c.length, "Should only be one element with class name " + a);
            return shaka.util.Dom.asHTMLElement(c[0])
        };
        shaka.util.Dom.removeAllChildren = function(a) {
            for (; a.firstChild;) a.removeChild(a.firstChild)
        };
        goog.exportSymbol("shaka.util.Dom.removeAllChildren", shaka.util.Dom.removeAllChildren);
        /*
         @license
         EME Encryption Scheme Polyfill
         Copyright 2019 Google LLC
         SPDX-License-Identifier: Apache-2.0
        */
        var EmeEncryptionSchemePolyfill = function() {};
        goog.exportSymbol("EmeEncryptionSchemePolyfill", EmeEncryptionSchemePolyfill);
        EmeEncryptionSchemePolyfill.install = function() {
            EmeEncryptionSchemePolyfill.originalRMKSA_ ? console.debug("EmeEncryptionSchemePolyfill: Already installed.") : navigator.requestMediaKeySystemAccess && MediaKeySystemAccess.prototype.getConfiguration ? (EmeEncryptionSchemePolyfill.originalRMKSA_ = navigator.requestMediaKeySystemAccess, console.debug("EmeEncryptionSchemePolyfill: Waiting to detect encryptionScheme support."), navigator.requestMediaKeySystemAccess = EmeEncryptionSchemePolyfill.probeRMKSA_) : console.debug("EmeEncryptionSchemePolyfill: EME not found")
        };
        goog.exportProperty(EmeEncryptionSchemePolyfill, "install", EmeEncryptionSchemePolyfill.install);
        EmeEncryptionSchemePolyfill.probeRMKSA_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            return console.assert(c == navigator, 'bad "this" for requestMediaKeySystemAccess'), e.yield(EmeEncryptionSchemePolyfill.originalRMKSA_.call(c, a, b), 2);
                        case 2:
                            f = e.yieldResult;
                            if (hasEncryptionScheme(f)) return console.debug("EmeEncryptionSchemePolyfill: Native encryptionScheme support found."), navigator.requestMediaKeySystemAccess =
                                EmeEncryptionSchemePolyfill.originalRMKSA_, e["return"](f);
                            console.debug("EmeEncryptionSchemePolyfill: No native encryptionScheme support found. Patching encryptionScheme support.");
                            navigator.requestMediaKeySystemAccess = EmeEncryptionSchemePolyfill.polyfillRMKSA_;
                            return e["return"](EmeEncryptionSchemePolyfill.polyfillRMKSA_.call(c, a, b))
                    }
                })
            })
        };
        EmeEncryptionSchemePolyfill.polyfillRMKSA_ = function(a, b) {
            var c = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function e() {
                var f, g, h, k, l, m, n, q;
                return $jscomp.generator.createGenerator(e, function(e) {
                    switch (e.nextAddress) {
                        case 1:
                            console.assert(c == navigator, 'bad "this" for requestMediaKeySystemAccess');
                            f = guessSupportedScheme(a);
                            g = [];
                            for (var p = $jscomp.makeIterator(b), r = p.next(); !r.done; r = p.next()) h = r.value, k = EmeEncryptionSchemePolyfill.filterCapabilities_(h.videoCapabilities, f), l = EmeEncryptionSchemePolyfill.filterCapabilities_(h.audioCapabilities,
                                f), h.videoCapabilities && h.videoCapabilities.length && !k.length || h.audioCapabilities && h.audioCapabilities.length && !l.length || (m = Object.assign({}, h), m.videoCapabilities = k, m.audioCapabilities = l, g.push(m));
                            if (!g.length) throw n = Error("Unsupported keySystem or supportedConfigurations."), n.name = "NotSupportedError", n.code = DOMException.NOT_SUPPORTED_ERR, n;
                            return e.yield(EmeEncryptionSchemePolyfill.originalRMKSA_.call(c, a, g), 2);
                        case 2:
                            return q = e.yieldResult, e["return"](new EmeEncryptionSchemePolyfillMediaKeySystemAccess(q,
                                f))
                    }
                })
            })
        };
        EmeEncryptionSchemePolyfill.filterCapabilities_ = function(a, b) {
            return a ? a.filter(function(a) {
                return !a.encryptionScheme || a.encryptionScheme == b
            }) : a
        };
        var McEncryptionSchemePolyfill = function() {};
        goog.exportSymbol("McEncryptionSchemePolyfill", McEncryptionSchemePolyfill);
        McEncryptionSchemePolyfill.install = function() {
            navigator.mediaCapabilities ? (McEncryptionSchemePolyfill.originalDecodingInfo_ = navigator.mediaCapabilities.decodingInfo, console.debug("McEncryptionSchemePolyfill: Waiting to detect encryptionScheme support."), navigator.mediaCapabilities.decodingInfo = McEncryptionSchemePolyfill.probeDecodingInfo_) : console.debug("McEncryptionSchemePolyfill: MediaCapabilities not found")
        };
        goog.exportProperty(McEncryptionSchemePolyfill, "install", McEncryptionSchemePolyfill.install);
        McEncryptionSchemePolyfill.probeDecodingInfo_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return console.assert(b == navigator.mediaCapabilities, 'bad "this" for decodingInfo'), d.yield(McEncryptionSchemePolyfill.originalDecodingInfo_.call(b, a), 2);
                        case 2:
                            e = d.yieldResult;
                            if (!a.keySystemConfiguration) return d["return"](e);
                            f = e.keySystemAccess;
                            if (hasEncryptionScheme(f)) return console.debug("McEncryptionSchemePolyfill: Native encryptionScheme support found."),
                                navigator.mediaCapabilities.decodingInfo = McEncryptionSchemePolyfill.originalDecodingInfo_, d["return"](e);
                            console.debug("McEncryptionSchemePolyfill: No native encryptionScheme support found. Patching encryptionScheme support.");
                            navigator.mediaCapabilities.decodingInfo = McEncryptionSchemePolyfill.polyfillDecodingInfo_;
                            return d["return"](McEncryptionSchemePolyfill.polyfillDecodingInfo_.call(b, a))
                    }
                })
            })
        };
        McEncryptionSchemePolyfill.polyfillDecodingInfo_ = function(a) {
            var b = this;
            return $jscomp.asyncExecutePromiseGeneratorFunction(function d() {
                var e, f, g, h, k, l, m;
                return $jscomp.generator.createGenerator(d, function(d) {
                    switch (d.nextAddress) {
                        case 1:
                            return console.assert(b == navigator.mediaCapabilities, 'bad "this" for decodingInfo'), e = null, a.keySystemConfiguration && (f = a.keySystemConfiguration, g = f.keySystem, h = f.audio && f.audio.encryptionScheme, k = f.video && f.video.encryptionScheme, e = guessSupportedScheme(g), l = {
                                powerEfficient: !1,
                                smooth: !1,
                                supported: !1,
                                keySystemAccess: null,
                                configuration: a
                            }, h && h != e || k && k != e) ? d["return"](l) : d.yield(McEncryptionSchemePolyfill.originalDecodingInfo_.call(b, a), 2);
                        case 2:
                            return m = d.yieldResult, m.keySystemAccess && (m.keySystemAccess = new EmeEncryptionSchemePolyfillMediaKeySystemAccess(m.keySystemAccess, e)), d["return"](m)
                    }
                })
            })
        };
        var EmeEncryptionSchemePolyfillMediaKeySystemAccess = function(a, b) {
            this.mksa_ = a;
            this.scheme_ = b;
            this.keySystem = a.keySystem
        };
        EmeEncryptionSchemePolyfillMediaKeySystemAccess.prototype.getConfiguration = function() {
            var a = this.mksa_.getConfiguration();
            if (a.videoCapabilities)
                for (var b = $jscomp.makeIterator(a.videoCapabilities), c = b.next(); !c.done; c = b.next()) c.value.encryptionScheme = this.scheme_;
            if (a.audioCapabilities)
                for (b = $jscomp.makeIterator(a.audioCapabilities), c = b.next(); !c.done; c = b.next()) c.value.encryptionScheme = this.scheme_;
            return a
        };
        EmeEncryptionSchemePolyfillMediaKeySystemAccess.prototype.createMediaKeys = function() {
            return this.mksa_.createMediaKeys()
        };

        function guessSupportedScheme(a) {
            if (a.startsWith("com.widevine") || a.startsWith("com.microsoft") || a.startsWith("com.adobe") || a.startsWith("org.w3")) return "cenc";
            if (a.startsWith("com.apple")) return "cbcs-1-9";
            console.warn("EmeEncryptionSchemePolyfill: Unknown key system:", a, "Please contribute!");
            return null
        }

        function hasEncryptionScheme(a) {
            a = a.getConfiguration();
            var b = a.audioCapabilities && a.audioCapabilities[0];
            return (a = a.videoCapabilities && a.videoCapabilities[0] || b) && void 0 !== a.encryptionScheme ? !0 : !1
        }
        var EncryptionSchemePolyfills = function() {};
        goog.exportSymbol("EncryptionSchemePolyfills", EncryptionSchemePolyfills);
        EncryptionSchemePolyfills.install = function() {
            EmeEncryptionSchemePolyfill.install();
            McEncryptionSchemePolyfill.install()
        };
        goog.exportProperty(EncryptionSchemePolyfills, "install", EncryptionSchemePolyfills.install);
        (function() {
            "undefined" !== typeof module && module.exports && (module.exports = EncryptionSchemePolyfills)
        })();
    }).call(exportTo, innerGlobal, innerGlobal, undefined);
    if (typeof exports != "undefined")
        for (var k in exportTo.shaka) exports[k] = exportTo.shaka[k];
    else if (typeof define == "function" && define.amd) define(function() {
        return exportTo.shaka
    });
    else innerGlobal.shaka = exportTo.shaka
})();