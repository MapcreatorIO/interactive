L.Control.MapStatus = L.Control.extend({
  options: {
    position: 'bottomleft',
    icon: L.Browser.mobile ? 'touch' : 'desktop'
  },
  onAdd: function (map) {
    this._div = L.DomUtil.create('div', 'touch-info');
    return this._div;
  },
  enable: function() {
    var action = L.Browser.mobile ? 'Hold' : 'Right click';
    this._div.innerHTML = '<i class="touch-info-icon '+this.options.icon+'-enabled"></i>'+action+' to deactivate';
    this._enabled = true;
    return this;
  },
  disable: function() {
    var action = L.Browser.mobile ? 'Tap' : 'Click';
    this._div.innerHTML = '<i class="touch-info-icon '+this.options.icon+'-disabled"></i>'+action+' to activate';
    this._enabled = false;
    return this;
  },
  enabled: function() {
    return this._enabled;
  }
});

L.control.MapStatus = function() {
  return new L.Control.MapStatus();
}





