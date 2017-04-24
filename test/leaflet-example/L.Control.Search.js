L.Control.Search = L.Control.extend({
  options: {
    position: 'topright',
    placeholder: 'Search...'
  },
  initialize: function (options ) {
    L.setOptions(this, options);
  },
  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'search-container');
    this.form = L.DomUtil.create('form', 'form', container);
    
    var group = L.DomUtil.create('div', 'form-group', this.form);
    this.input = L.DomUtil.create('input', 'form-control input-sm', group);
    this.input.type = 'text';
    this.input.placeholder = this.options.placeholder;
    this.results = L.DomUtil.create('div', 'list-group', group);

    L.DomEvent.addListener(this.form, 'submit', this.submit, this);
    L.DomEvent.addListener(this.input, 'keyup', this.keyup, this); // Debounce
    L.DomEvent.disableClickPropagation(container);
    return container;
  },
  onRemove: function (map) {
    // when removed
    L.DomEvent.removeListener(this._input, 'keyup', this.keyup, this);
    L.DomEvent.removeListener(form, 'submit', this.submit, this);
  },
  keyup: function(e) {
    if (e.keyCode === 38 || e.keyCode === 40) {
      // do nothing
    } else {
      this.results.innerHTML = '';
      // console.log('fff'); 
      if (this.input.value.length > 2) {
        var value = this.input.value;
      }
    }
  },
  itemSelected: function(e) {
    // L.DomEvent.preventDefault(e);
    var elem = e.target;
    var value = elem.innerHTML;
    this.results.innerHTML = '';
  },
  submit: function(e) {
    // L.DomEvent.preventDefault(e);
  }
});