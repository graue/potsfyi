// Copyright (c) 2013 Turboprop Inc
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// from https://github.com/usepropeller/react.backbone/tree/70aebdc0b0975657649a62bf56b7d19f988f8973
// edited to work with Browserify

var React = require('react');
var Backbone = require('backbone');

React.BackboneMixin = {
    _subscribe: function(model) {
        if (!model) {
            return;
        }
        // Detect if it's a collection
        if (model instanceof Backbone.Collection) {
            model.on('add remove reset sort', function () { this.forceUpdate(); }, this);
        }
        else if (model) {
            var changeOptions = this.changeOptions || 'change';
            model.on(changeOptions, (this.onModelChange || function () { this.forceUpdate(); }), this);
        }
    },
    _unsubscribe: function(model) {
        if (!model) {
            return;
        }
        model.off(null, null, this);
    },
    componentDidMount: function() {
        // Whenever there may be a change in the Backbone data, trigger a reconcile.
        this._subscribe(this.props.model);
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.model !== nextProps.model) {
            this._unsubscribe(this.props.model);
            this._subscribe(nextProps.model);
        }
    },
    componentWillUnmount: function() {
        // Ensure that we clean up any dangling references when the component is destroyed.
        this._unsubscribe(this.props.model);
    }
};

React.createBackboneClass = function(spec) {
    var currentMixins = spec.mixins || [];

    spec.mixins = currentMixins.concat([React.BackboneMixin]);
    spec.getModel = function() {
        return this.props.model;
    };
    spec.model = function() {
        return this.getModel();
    };
    spec.el = function() {
        return this.isMounted() && this.getDOMNode();
    };
    return React.createClass(spec);
};
