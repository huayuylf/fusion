/**
 * T.D3Overlay鍊熷姪D3.js寮哄ぇ鐨勫彲瑙嗗寲鍔熻兘锛屾墿灞曞ぉ鍦板浘宸叉湁鐨勮鐩栫墿绫� T.Overlay锛�
 * 浣垮ぉ鍦板浘琛ㄨ揪鐨勫彲瑙嗗寲淇℃伅锛屼笉浠呬粎鍙湁鍦扮悊鏁版嵁灞曠ず锛屼篃鍙互缁撳悎鏇翠赴瀵岀殑鍥惧舰(鏌卞浘锛岄ゼ鍥�)鏉ユ弿杩般€佸睍鐜版暟鎹€�
 * 娉細chrome銆乻afari銆両E9鍙婁互涓婃祻瑙堝櫒銆�
 */

T.D3Overlay = T.Overlay.extend({

    initialize: function (init, redraw, options) {
        this.uid = new Date().getTime();
        this.init = init;
        this.redraw = redraw;
        if (options)
            this.options = options;
        d3.select("head")
            .append("style").attr("type", "text/css")

    },

    /**
     * 鍦板浘缂╂斁瑙﹀彂鐨勫嚱鏁�
     * @private
     */
    _zoomChange: function () {
        if (!this.redraw)
            this.init(this.selection, this.transform);
        else
            this.redraw(this.selection, this.transform);
    },

    onAdd: function (map) {
        this.map = map;
        var self = this;
        //澧炲姞svg瀹瑰櫒
        this._svg = new T.SVG();
        map.addLayer(this._svg);
        //鏍硅妭鐐�
        this._rootGroup = d3.select(this._svg._rootGroup).classed("d3-overlay", true);
        this.selection = this._rootGroup;
        //涓€浜涜浆鎹㈠弬鏁�
        this.transform = {
            //鍧愭爣杞鍣ㄥ儚绱犲潗鏍囥€�
            LngLatToD3Point: function (a, b) {
                var _lnglat = a instanceof T.LngLat ? a : new T.LngLat(a, b);
                var point = self.map.lngLatToLayerPoint(_lnglat);
                this.stream.point(point.x, point.y);
            },
            //鎹㈢畻涓€绫宠浆澶氬皯鍍忕礌
            unitsPerMeter: function () {
                return 256 * Math.pow(2, map.getZoom()) / 40075017
            },
            map: self.map,
            layer: self

        };
        this.transform.pathFromGeojson =
            d3.geo.path().projection(d3.geo.transform({
                point: this.transform.LngLatToD3Point
            }));
        //D3缁樺埗
        this.init(this.selection, this.transform);
        //鐢ㄤ簬纭畾鍧愭爣鐨�
        if (this.redraw)
            this.redraw(this.selection, this.transform);

        map.addEventListener("zoomend", this._zoomChange, this);


    },


    onRemove: function (map) {
        map.removeEventListener("zoomend", this._zoomChange, this);
        this._rootGroup.remove();
        map.removeOverLay(this._svg)
    },

    /**
     * 鍥惧眰绉诲姩鍒版渶涓婂眰
     * @returns {T.D3Overlay}
     */
    bringToFront: function () {
        if (this._svg && this._svg._rootGroup) {
            var el = this._svg._rootGroup.parentNode;
            el.parentNode.appendChild(el);

        }
        return this;
    },


    /**
     * 鍥惧眰绉诲姩鍒版渶搴曞眰銆�
     * @returns {T.D3Overlay}
     */
    bringToBack: function () {
        if (this._svg && this._svg._rootGroup) {
            var el = this._svg._rootGroup.parentNode;
            var parent = el.parentNode;
            parent.insertBefore(el, parent.firstChild);

        }
        return this;
    },


})
;


