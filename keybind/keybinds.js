/**
 * keybindFactory
 * Usage:
 * - add Keybind(Control+y)
 *   var kb = keybindFactory.add(element, 'C-y', function(event, [Keybind object]) { ... });
 *   (the kb is the Keybind object)
 * - remove Keybind
 *   keybindFactory.remove(kb);
 *   or
 *   keybindFactory.removeByKey(element, 'C-y');
 * - get key
 *   var textform = document.getElementById('text-form');
 *   keybindFactory.getKey(textform, function(key, event) { ... });
 * - get Keybinds
 *   - all keybinds
 *     var keybinds = keybindFactory.getKeybinds();
 *   - if a key specified
 *     var keybinds = keybindFactory.getKeybinds("C-y");
 *   - if a DOM Element specified
 *     var keybinds = keybindFactory.getKeybinds(window);
 *   - both
 *     var keybinds = keybindsFactory.getKeybinds("C-y", window);
 */
var keybindFactory = {
    _event_binding_elements: null,
    _event_type: 'keydown',
    _keybinds: [],
    _keys: {
        9: "TAB",
        27: "ESC",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "Left",
        38: "Up",
        39: "Right",
        40: "Down",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12"
    },
    _skeys: {
        8: "BS",
        10: "RET",
        13: "RET",
        32: "SPC"
    },
    _mkeys: {
        'altKey': "A",
        'ctrlKey': "C",
        'metaKey': "M",
        'shiftKey': "S"
    },

    _create: function(element, key, callback, force) {
        var self = this;
        return new (function Keybind(element, key, callback, force) {
            this.element = element;
            this.key = key;
            this.callback = callback;
            this.force = (force === undefined) ? false : force;

            this.execute = function(evt) {
                if (!this.force)
                    if (self.isForm(evt.target)) return;
                this.callback.call(this.element, evt, this);
            }
        })(element, key, callback, force);
    },

    init: function() {
        var ebe = this._event_binding_elements;
        if (ebe && (ebe.length > 0)) {
            this.unbind();
        }
        this.bind();
    },

    /**
     * @param elem binding element (default: window)
     */
    bind: function(elem) {
        if (!elem) elem = window;
        var ebe = this._event_binding_elements;
        if (ebe === null) { ebe = []; }
        if (elem in ebe) return;
        elem.addEventListener(this._event_type, this._listener, false);
        ebe.push(elem);
    },

    /**
     * @param elem
     */
    unbind: function(elem) {
        var ebe = this._event_binding_elements;
        if (!ebe || (ebe.length === 0)) return;
        var i;
        for (i=0; i<ebe.length; i++) {
            if ((elem === ebe[i]) || !elem) {
                ebe[i].removeEventListener(this._event_type, this._listener, false);
                delete ebe[i];
            }
        }
    },

    _listener: function(evt) {
        var self = keybindFactory;
        var key = self.getKeyFromEvent(evt);
        if (key === "") return;
        var kbs = self._keybinds, i = 0;
        for (i=0; i<kbs.length; i++) {
            if ((kbs[i].key === key) && ((kbs[i].element === evt.target) ||
                    (/^(?:\[object DOMWindow\]|\[object HTMLDocument\])$/.test(kbs[i].element.toString())))) {
                kbs[i].execute(evt);
            }
        }
    },

    /**
     * create Keybind object.
     * @param element a DOM eEement
     * @param key key(e.x. Control + y -> C-y)
     * @param callback a callback function
     * @param force execute the callback even where at the input/textarea
     */
    add: function(element, key, callback, force) {
        if (!element || !key) { return null; }
        if (this._event_binding_elements === null) {
            this.init();
        }
        var kb = this._create(element, key, callback, force);
        this._keybinds.push(kb);
        return kb;
    },

    /**
     * return Keybind objects.
     * @param element a DOM Element
     * @param key key(e.x. Control + y -> C-y)
     */
    getKeybinds: function(element, key) {
        var kbs = this._keybinds, i;
        if ((!element && !key) || (!kbs || kbs.length < 1)) { return kbs; }
        if (typeof element === "string") {
            key = element;
            element = undefined;
        }
        var binds = [];
        for (i=0; i<kbs.length; i++) {
            if (((key === undefined) || (kbs[i].key === key)) &&
                    ((element === undefined) || (kbs[i].element === element))) {
                binds.push(kbs[i]);
            }
        }
        return binds;

    },

    /**
     * get a key from KeyboardEvent(keydown etc..)
     * @param evt a KeyboardEvent object
     * @param isModifierKey if a getting key is a modifier key only, the attribute is ture.
     */
    getKeyFromEvent: function(evt, isModifierKey) {
        var key = [], k = '';
        var mkeys = this._mkeys;
        for (var mk in mkeys) {
            if (evt[mk] && mkeys.hasOwnProperty(mk)) {
                if (isModifierKey) return mk;
                if ((mk === "metaKey") && (evt["ctrlKey"] === true)) {
                    continue;
                }
                key.push(this._mkeys[mk]);
            }
        }
        if (isModifierKey) return undefined;
        if (evt.which) {
            k = this._skeys[evt.which] || this._keys[evt.which] || String.fromCharCode(evt.which).toLowerCase();
        } else if (evt.keyCode) {
            k = this._keys[evt.keyCode];
        }

        if (/^(?:[a-zA-Z0-9]+)$/.test(k)) {
            key.push(key.length ? '-'+k : k);
            return key.join('');
        } else {
            return undefined;
        }
    },

    /**
     *
     * @param element (optional, default:window)
     * @param callback (required)
     * @param isModifierKey if a getting key is a modifier key only, the attribute is ture.
     */
    getKey: function(element, callback, isModifierKey) {
        var self = this;
        if (typeof element === "function") {
            if (callback !== undefined) {
                isModifierKey = callback;
            }
            callback = element;
            element = window;
        }
        if (typeof callback !== "function") { return undefined; }
        element.addEventListener('keydown', function(evt) {
            var key = self.getKeyFromEvent(evt, !!isModifierKey);
            callback.call(element, key, evt);
        }, false);

    },

    /**
     * remove a Keybind from Keybind object.
     * @param keybind Keybind object
     */
    remove: function(keybind) {
        if (keybind) {
            this._keybinds = this._keybinds.filter(function(bind) {
                return (keybind != bind);
            });
        }
    },

    /**
     * remove a Keybind from a Element and a key
     * @param element DOM Element
     * @param key key (e.x. Control + y -> C-y)
     */
    removeByKey: function(element, key) {
        this._keybinds = this._keybinds.filter(function(keybind) {
            return (!(keybind.element === element && keybind.key === key));
        });
    },

    removeAll: function() {
        var kbs = this._keybinds, i = 0;
        if (!kbs || kbs.length === 0) {
            return;
        }
        for (i=0; i<kbs.length; i++) {
            delete kbs[i];
        }
    },

    /**
     * the method checks whether a input field or a textarea.
     * @return boolean if the node is input or textarea, return true.
     */
    isForm: function(node) {
        return /^(?:input|textarea)$/.test(node.nodeName.toLowerCase());
    }
};
