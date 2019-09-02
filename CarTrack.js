/****
 * 渚濊禆浜庡ぉ鍦板浘鐨凞3.js鏀寔搴擄紝浠VG鐨勫舰寮忓杞﹁締琛岄┒浣嶇疆鍙婅建杩硅繘琛屽疄鏃惰窡韪拰鍔ㄦ€佸睍绀恒€�
 * 瀹炵幇杞﹁締娌胯矾绾胯繍鍔紝骞舵湁鏆傚仠绛夊姛鑳姐€�
 * 娉細chrome銆乻afari銆両E9鍙婁互涓婃祻瑙堝櫒銆�
 * @author juyang
 * ****/

/**
 * 杞﹁締鐨勫浘鐗囷紝鍖呭惈鍧愭爣鍜屾棆杞浉鍏虫柟娉�
 */
var CarOverlay = T.Overlay.extend({
    initialize: function (lnglat, options) {
        this.lnglat = lnglat;
        this.setOptions(options);
        this.options = options;
    },

    onAdd: function (map) {
        this.map = map;
        var div = this.div = document.createElement("div");
        var img = this.img = document.createElement("img");
        div.style.position = "absolute";
        div.style.width = this.options.width + "px";
        div.style.height = this.options.height + "px";
        div.style.marginLeft = -this.options.width / 2 + 'px';
        div.style.marginTop = -this.options.height / 2 + 'px';
        div.style.zIndex = 200;// this._container.style.zIndex = zIndex;
        img.style.width = this.options.width + "px";
        img.style.height = this.options.height + "px";
        img.src = this.options.iconUrl;
        div.appendChild(img);
        map.getPanes().overlayPane.appendChild(this.div);
        this.update(this.lnglat);
    },

    onRemove: function () {
        var parent = this.div.parentNode;
        if (parent) {
            parent.removeChild(this.div);
            this.map = null;
            this.div = null;
        }
    },

    /**
     * 姣忎釜娴忚鍣ㄧ殑鍋忚浆鍏煎
     * @returns {string}
     * @constructor
     */
    CSS_TRANSFORM: function () {
        var div = document.createElement('div');
        var props = [
            'transform',
            'WebkitTransform',
            'MozTransform',
            'OTransform',
            'msTransform'
        ];

        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            if (div.style[prop] !== undefined) {
                return prop;
            }
        }
        return props[0];
    },

    /**
     * 鍋忚浆瑙掑害
     * @param rotate
     */
    setRotate: function (rotate) {
        this.img.style[this.CSS_TRANSFORM()] = "rotate(" +
            rotate + "deg)";
    },

    setLnglat: function (lnglat) {
        this.lnglat = lnglat;
        this.update();
    },
    getLnglat: function () {
        return this.lnglat;
    },
    setPos: function (pos) {
        this.lnglat = this.map.layerPointToLngLat(pos)
        this.update();
    },
    /**
     * 鏇存柊浣嶇疆
     */
    update: function () {
        var pos = this.map.lngLatToLayerPoint(this.lnglat);
        this.div.style.left = pos.x + "px";
        this.div.style.top = pos.y + "px";
    }


})

T.CarTrack = function (map, opt) {
    this.map = map;

    //  this.options = opt ? opt : {};
    //  this.options= this.setOptions(this.options,opt)
    //this.options.interval = this.options.interval ? this.options.interval : 1000;

    // this.options.uid = new Date().getTime();
    // this.uid = this.options.uid
    this.options.polylinestyle = this.setOptions(this.options.polylinestyle, opt.polylinestyle)
    this.options.carstyle = this.setOptions(this.options.carstyle, opt.carstyle)
    this.options = this.setOptions(this.options, opt)
    this.init();

}

T.CarTrack.prototype = {

    options: {

        interval: 1000,
        carstyle: {
            display: true,
            iconUrl: "http://lbs.tianditu.gov.cn/images/openlibrary/car.png",
            width: 52,
            height: 26
        },
        polylinestyle: {
            display: true,
            color: "red",
            width: "3",
            opacity: 0.8,
            lineStyle: ""
        }
    },


    init: function () {
        var datas = this.options.Datas;
        this.options = this._deepCopy(this.options);
        this.options.uid=new Date().getTime();
        this.options.Datas = datas;
        if (this.options.speed > 0) {
            var dis = this.distance(this.options.Datas);
            this.options.nodeslength = dis / this.options.speed;//鎬绘鏁帮紱
        }
        else {
            this.options.nodeslength = this.options.Datas.length;//鎬绘鏁帮紱
        }
        //璁℃鍣�
        this.options.Counter = 0;
        //new鍑篋3鐨勫浘灞傦紝绛夊緟鏁版嵁


        this.D3OverLayer = new T.D3Overlay(this.d3init, this.d3redraw, this.options);
        this.D3OverLayer.lineDatas = [];//绾挎暟鎹�
        //鍏变韩涓や釜鍑芥暟
        this.D3OverLayer.dataToLnglat = this.dataToLnglat;
        this.D3OverLayer.applyLatLngToLayer = this.applyLatLngToLayer;
        //this.D3OverLayer.updateSymbolLine = this.updateSymbolLine;
        //鎺ユ敹锛屽鐞嗘暟鎹紝鍔犺浇杞ㄨ抗鍜岃溅杈嗭紱
        this.receiveData(this.map);


    },

    setOptions: function (obj, options) {
        for (var i in options) {
            if (i != "polylinestyle" && i != "carstyle")
                obj[i] = options[i];
        }
        return obj;
    },
    /**
     *  娓呴櫎鎵€鏈夊厓绱狅紝娉ㄩ攢浜嬩欢
     */
    clear: function () {
        this.state = 4;
        this._Remove();
        delete this;
    },

    _Remove: function () {
        this._pause();
        delete this._timer;
        this._timer = null;
        this.map.removeOverLay(this.carMarker);
        this.map.removeOverLay(this.D3OverLayer);
    },

    /**澶勭悊浼犲叆鐨勬暟鎹�**/
    receiveData: function () {
        var opt = this.options;
        var me = this;

        if (opt.Datas instanceof Array && opt.Datas.length > 0) {
            //缁樺埗鍑篋3娓叉煋鐨勭嚎娈碉紱
            me.map.addOverLay(me.D3OverLayer)
            //缁樺埗杞﹁締
            me.carMarker = new CarOverlay(me.dataToLnglat(this.options.Datas[0]), me.options.carstyle);
            if (!this.options.carstyle)
                me.carMarker.hide();
            me.map.addOverLay(this.carMarker);

            me.D3OverLayer.bringToBack();
        }

    },
    /**
     * 鍧愭爣鑾峰彇
     * @param obj
     * @returns {T.LngLat}
     */
    dataToLnglat: function (obj) {
        if (obj instanceof T.LngLat || ('lat' in obj && 'lng' in obj))
            return obj;
        else {
            var coordinates = obj.geometry.coordinates;
            var lnlat = new T.LngLat(coordinates[0], coordinates[1]);
            return lnlat;
        }


    },

    bind: function (fn, obj) {
        var slice = Array.prototype.slice;
        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }
    },


    /**
     * 鍧愭爣杞崲
     * @param d
     * @returns {*}
     */
    applyLatLngToLayer: function (d) {

        return this.map.lngLatToLayerPoint(this.dataToLnglat(d));
    },

    d3init: function (sel, transform) {

        sel.append("path")
            .attr("id", "polyline" + this.options.uid)
            .attr("fill", "none")
            .attr("stroke", this.options.polylinestyle.color)
            .attr("width", this.options.polylinestyle.width)
            .attr('opacity', this.options.polylinestyle.opacity)
            .attr('display', this.options.polylinestyle.display ? "block" : "none")

        sel.append("path")
            .attr("id", "dynamicLine" + this.options.uid)
            .attr("fill", "none")
            .attr("stroke", this.options.polylinestyle.color)
            .attr("width", this.options.polylinestyle.width)
            .attr('opacity', this.options.polylinestyle.opacity)
            .attr('display', this.options.dynamicLine && this.options.polylinestyle.display ? "block" : "none")

    },


    d3redraw: function () {
        //鍍忕礌鐐瑰潗鏍囪浆瀛楃涓�
        function pointsToPath(rings, closed) {
            var str = '',
                i, j, len, len2, points, p;

            for (i = 0, len = rings.length; i < len; i++) {
                points = rings[i];

                for (j = 0, len2 = points.length; j < len2; j++) {
                    p = points[j];
                    str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
                }

                // closes the ring for polygons; "x" is VML syntax
                str += closed ? (L.Browser.svg ? 'z' : 'x') : '';
            }

            // SVG complains about empty path strings
            return str || 'M0 0';
        }

        function lnglatsTopoints(map, lnglats) {
            var pts = [];
            for (var k = 0; k < lnglats.length; k++) {
                pts.push(map.lngLatToLayerPoint(lnglats[k]))
            }
            return pts;
        }
        var datasStr1 = pointsToPath([lnglatsTopoints(this.map, this.options.Datas)], false);//this._svg.
        var lineDatas = this.lineDatas ? this.lineDatas : this.D3OverLayer.lineDatas;
        var datasStr2 = pointsToPath([lnglatsTopoints(this.map, lineDatas)], false);//this.options.dynamicLine ? this.lineDatas : this.options.Datas;
        //绾挎暟鎹殑閲嶆柊璁＄畻鍒嗕袱绉嶆儏鍐� 1銆佺缉鏀惧湴鍥炬椂瑕侀噸鏂拌绠楀鍣ㄥ潗鏍� 2銆佸姩鎬佺嚎鐨勬椂鍊欒閲嶇粯绾�
        d3.select("path#polyline" + this.options.uid).attr("d", datasStr1)
            .attr("stroke-width", this.options.polylinestyle.width + "px");

        d3.select("path#dynamicLine" + this.options.uid).attr("d", datasStr2)
            .attr("stroke-width", this.options.polylinestyle.width + "px");


    },


    /**
     * 闅忕潃鏃堕棿
     */
    update: function () {
        //璁℃鍣�+1
        this.options.Counter++
        var linePath = d3.select('path#polyline' + this.options.uid)
            .attr('display', this.options.polylinestyle.display && !this.options.dynamicLine ?
                "block" : "none")
        //杞ㄨ抗鍍忕礌闀垮害
        var nodeslength = (this.options.speed > 0 ?
                Math.ceil(this.options.nodeslength) + 1 :
                Math.ceil(this.options.nodeslength)
        )

        if (this.options.speed > 0) {
            //璁＄畻灏忚溅鎵€鍦ㄧ殑鍍忕礌鐐�
            var l = linePath.node().getTotalLength();
            var s = (this.options.Counter - 1 ) / this.options.nodeslength
            var l1 = s * l;
            var p1 = linePath.node().getPointAtLength(l1);
            this.D3OverLayer.lineDatas = [];
            if (this.options.Datas[0])
                this.D3OverLayer.lineDatas.push(this.options.Datas[0]);
            var lsum = 0;
            // 璁＄畻鍍忕礌鐐瑰墠鐨勬墍鏈夊寘鍚殑杞ㄨ抗鍧愭爣鐨勫儚绱犵偣
            for (var k = 0; k < this.options.Datas.length - 1; k++) {
                var p2 = this.map.lngLatToLayerPoint(this.options.Datas[k]);
                var p3 = this.map.lngLatToLayerPoint(this.options.Datas[k + 1]);
                var l2 = p2.distanceTo(p3);
                lsum = lsum + l2;
                if (l1 > lsum)
                    this.D3OverLayer.lineDatas.push(this.options.Datas[k + 1]);
                else {
                    break;
                }
            }
            if (this.options.Counter < nodeslength) {
                var lnglat = this.map.layerPointToLngLat(p1)
                this.D3OverLayer.lineDatas.push(lnglat);
            }

        }
        else {
            this.D3OverLayer.lineDatas = this.options.Datas.slice(0, this.options.Counter);
        }

        this.carMarker.setLnglat(this.D3OverLayer.lineDatas[this.D3OverLayer.lineDatas.length - 1]);
        //杞﹁締鍋忚浆瑙掕绠椼€�
        if (this.options.Counter > 1) {
            var rotate = this.angle(
                this.D3OverLayer.lineDatas[this.D3OverLayer.lineDatas.length - 2],
                this.D3OverLayer.lineDatas[this.D3OverLayer.lineDatas.length - 1]);
            this.carMarker.setRotate(rotate)
        }
        else {
            this.carMarker.setRotate(0)
        }
        if (this.options.dynamicLine) this.d3redraw();

        /**鍥炶皟鍑芥暟锛岃溅杈嗘瘡绉诲姩涓€娆¤Е鍙戠殑鍑芥暟
         *Lnglat锛氱粡杩囩殑鍧愭爣
         *index锛氳妭鐐瑰簭鍙枫€�
         *length:鎬昏妭鐐规暟閲忋€�
         ***/
        if (this.options.passOneNode) this.options.passOneNode(
            this.carMarker.getLnglat(),
            this.options.Counter,
            nodeslength
        )
        if (this.options.Counter >= nodeslength) {
            this.options.Counter = 0;
        }
    },


    /**
     * 璁＄畻杞ㄨ抗鐨勮窛绂�
     * @returns {number}
     */
    distance: function () {
        var d = 0;
        var datas = this.options.Datas;
        var l = datas.length;
        for (var i = 0; i < l - 1; i++) {
            var p1 = this.dataToLnglat(datas[i]);
            var p2 = this.dataToLnglat(datas[i + 1]);
            d = d + this.map.getDistance(p1, p2);
        }
        return d;
    },

    /**
     *鍦ㄦ瘡涓偣鐨勭湡瀹炴楠や腑璁剧疆灏忚溅杞姩鐨勮搴�
     */

    angle: function (curPos, targetPos) {
        var deg = 0;
        if (targetPos.lng != curPos.lng) {
            var tan = (targetPos.lat - curPos.lat) / (targetPos.lng - curPos.lng),
                atan = Math.atan(tan);
            deg = -atan * 360 / (2 * Math.PI);
            if (targetPos.lng < curPos.lng) {
                deg = -deg + 90 + 90;

            } else {
                deg = -deg;
            }
            return -deg;
        } else {
            var disy = targetPos.lat - curPos.lat;
            var bias = 0;
            if (disy > 0)
                bias = -1
            else
                bias = 1
            return (-bias * 90);
        }
        return;

    },

    /**
     *寮€濮嬭繍鍔�
     */
    start: function () {
        if (this.state == 4)return;
        this.state = 1;
        if (this.D3OverLayer && !this._timer) {
            this._timer = setInterval(this.bind(this.update, this),
                this.options.interval);
        }
    },

    /**
     * 鍋滄杩愬姩
     */
    stop: function () {
        if (this.state == 4)return;
        this.state = 2;
        this._pause();
        this._Remove();
        this.init();

    },

    _pause: function () {
        if (this._timer) {
            clearTimeout(this._timer);
            delete this._timer;
            this._timer = null;
        }

        return this;
    },
    /**
     * 鏆傚仠杩愬姩
     */
    pause: function () {
        if (this.state == 4)return;
        this.state = 3;
        this._pause();
    },
    _deepCopy: function (source) {
        var result = {};
        for (var key in source) {
            result[key] = typeof source[key] === 'object' ? this._deepCopy(source[key]) : source[key];
        }
        return result;
    }


}



