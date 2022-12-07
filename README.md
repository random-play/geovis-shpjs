# 基于 Shapefile.js 改造版本， 支持分批转换geojson数据

 

## Usage

For use with [browserify](http://browserify.org/), [webpack](https://webpack.github.io/):

    npm install geovis-shpjs --save
 

## API

Has a function `shp` which accepts a string which is the path the she shapefile minus the extension and returns a promise which resolves into geojson.

```javascript
	//for the shapefiles in the folder called 'files' with the name pandr.shp
	shp("files/pandr").then(function(geojson){
		//do something with your geojson
	});
```
or you can call it on a .zip file which contains the shapefile

```javascript
	//for the shapefiles in the files folder called pandr.shp
	shp("files/pandr.zip").then(function(geojson){
		//see bellow for whats here this internally call shp.parseZip()
	});
```

or if you got the zip some other way (like the [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)) then with the arrayBuffer you can call

```javascript
const geojson = await shp(buffer);
```
If there is only one shp in the zipefile it returns geojson, if there are multiple then it will be an array.  All of the geojson objects have an extra key `fileName` the value of which is the
name of the shapefile minus the extension (I.E. the part of the name that's the same for all of them)

You could also load the arraybuffers seperately:

```javascript
shp.combine([shp.parseShp(shpBuffer, /*optional prj str*/),shp.parseDbf(dbfBuffer)]);
``` 

增加的功能：解析包含shp的压缩文件， 分批读取geojson数据

```javascript 
shp.getZipShpDbfInfo(buffer).then(function(shpDbfInfo){
	console.log('shp and dbf info:', shpDbfInfo)
	// 获取从offset 20开始的20条geojson格式记录 
	shp.getPartialGeojson(shpDbfInfo, 20, 20).then( function(result) {
		console.log('result 20 -> 40:', result)
	})
})  
```




## LICENSE
Main library MIT license, original version was less permissive but there is 0 code shared. Included libraries are under their respective lisenses which are:
- [JSZip](https://github.com/Stuk/jszip/) by @Stuk MIT or GPLv3
- [lie](https://github.com/calvinmetcalf/lie) by me and @RubenVerborgh MIT
- [setImmediate](https://github.com/NobleJS/setImmediate) by @NobleJS et al MIT
- [World Borders shapefile](http://thematicmapping.org/downloads/world_borders.php) is CC-BY-SA 3.0.
- Park and Ride shapefile is from [MassDOT](http://mass.gov/massdot) and is public domain.
- MA town boundaries from [MassGIS](http://www.mass.gov/anf/research-and-tech/it-serv-and-support/application-serv/office-of-geographic-information-massgis/) and is public domain
- NJ County Boundaries from [NJgin](https://njgin.state.nj.us/NJ_NJGINExplorer/index.jsp) and should be public domain.
- [Proj4js](https://github.com/proj4js/proj4js) by me et al MIT

[![Dependency Status](https://david-dm.org/calvinmetcalf/shapefile-js.svg)](https://david-dm.org/calvinmetcalf/shapefile-js)
[![devDependency Status](https://david-dm.org/calvinmetcalf/shapefile-js/dev-status.svg)](https://david-dm.org/calvinmetcalf/shapefile-js#info=devDependencies)
[![peerDependency Status](https://david-dm.org/calvinmetcalf/shapefile-js/peer-status.svg)](https://david-dm.org/calvinmetcalf/shapefile-js#info=peerDependencies)
