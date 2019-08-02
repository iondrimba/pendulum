!function(e){var t={};function i(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=1)}([function(e,t,i){},function(e,t,i){"use strict";i.r(t);i(0);var n=function(e){var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16)/255,g:parseInt(t[2],16)/255,b:parseInt(t[3],16)/255}:null};function r(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(new(function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}var t,i,o;return t=e,(i=[{key:"setup",value:function(){this.gui=new dat.GUI,this.raycaster=new THREE.Raycaster,this.pendulum={length:18,angle:90,angleVelocity:0,angleAcceleration:0,origin:{x:0,y:10},current:{x:0,y:0}},this.backgroundColor="#0dea8d",this.gutter={size:.1},this.meshes=[],this.grid={cols:28,rows:12},this.width=window.innerWidth,this.height=window.innerHeight,this.mouse3D=new THREE.Vector2,this.gui.addFolder("Background").addColor(this,"backgroundColor").onChange(function(e){document.body.style.backgroundColor=e}),window.addEventListener("resize",this.onResize.bind(this),{passive:!0})}},{key:"createScene",value:function(){this.scene=new THREE.Scene,this.renderer=new THREE.WebGLRenderer({antialias:!0,alpha:!0}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=THREE.PCFSoftShadowMap,document.body.appendChild(this.renderer.domElement)}},{key:"createCamera",value:function(){var e=window.innerWidth,t=window.innerHeight;this.camera=new THREE.PerspectiveCamera(45,e/t),this.camera.position.set(-28.15292047581049,38.68633769613105,30.980321888960155),this.scene.add(this.camera)}},{key:"addAmbientLight",value:function(){var e={color:"#fff"},t=new THREE.AmbientLight(e.color,1);this.scene.add(t),this.gui.addFolder("Ambient Light").addColor(e,"color").onChange(function(e){t.color=n(e)})}},{key:"addSpotLight",value:function(){var e={color:"#fff"},t=new THREE.SpotLight(e.color,1);t.position.set(0,50,0),t.castShadow=!0,this.scene.add(t),this.gui.addFolder("Spot Light").addColor(e,"color").onChange(function(e){t.color=n(e)})}},{key:"addPointLight",value:function(e,t){var i=new THREE.PointLight(e,1,1e3,1);i.position.set(t.x,t.y,t.z),this.scene.add(i)}},{key:"addSphere",value:function(){var e={color:"#f90c53",metalness:.41,emissive:"#000000",roughness:0},t=new THREE.SphereGeometry(3,32,32),i=new THREE.MeshStandardMaterial(e);this.sphere=new THREE.Mesh(t,i),this.sphere.position.set(0,0,0);var r=this.gui.addFolder("Sphere Material");r.addColor(e,"color").onChange(function(e){i.color=n(e)}),r.add(e,"metalness",.1,1).onChange(function(e){i.metalness=e}),r.add(e,"roughness",.1,1).onChange(function(e){i.roughness=e}),this.scene.add(this.sphere)}},{key:"createGrid",value:function(){this.groupMesh=new THREE.Object3D;for(var e=new THREE.MeshPhysicalMaterial({color:"#fff",metalness:.3,emissive:"#000000",roughness:1}),t=0;t<this.grid.rows;t++){this.meshes[t]=[];for(var i=0;i<this.grid.cols;i++){var n=new THREE.BoxBufferGeometry(1,1,1),r=this.getMesh(n,e);r.position.y=2.5;var o=new THREE.Object3D;o.add(r),o.scale.set(1,1,1),o.position.set(i+i*this.gutter.size,0,t+t*this.gutter.size),this.meshes[t][i]=o,this.groupMesh.add(o)}}var s=.46*(this.grid.cols+this.grid.cols*this.gutter.size),a=.46*(this.grid.rows+this.grid.rows*this.gutter.size);this.groupMesh.position.set(-s,0,-a),this.scene.add(this.groupMesh)}},{key:"getMesh",value:function(e,t){var i=new THREE.Mesh(e,t);return i.castShadow=!0,i.receiveShadow=!0,i}},{key:"addCameraControls",value:function(){this.controls=new THREE.OrbitControls(this.camera,this.renderer.domElement)}},{key:"addFloor",value:function(){var e=new THREE.PlaneGeometry(300,300),t=new THREE.ShadowMaterial({opacity:.3});this.floor=new THREE.Mesh(e,t),this.floor.position.y=0,this.floor.rotateX(-Math.PI/2),this.floor.receiveShadow=!0,this.scene.add(this.floor)}},{key:"init",value:function(){this.setup(),this.createScene(),this.createCamera(),this.addAmbientLight(),this.addSpotLight(),this.addSphere(),this.createGrid(),this.addCameraControls(),this.addFloor(),this.animate()}},{key:"onResize",value:function(){this.width=window.innerWidth,this.height=window.innerHeight,this.camera.aspect=this.width/this.height,this.camera.updateProjectionMatrix(),this.renderer.setSize(this.width,this.height)}},{key:"draw",value:function(){this.pendulum.current.x=this.pendulum.origin.x+this.pendulum.length*Math.sin(this.pendulum.angle),this.pendulum.current.y=this.pendulum.origin.y+this.pendulum.length*Math.cos(this.pendulum.angle),this.pendulum.angleAcceleration=.002*Math.sin(this.pendulum.angle),this.pendulum.angleVelocity+=this.pendulum.angleAcceleration,this.pendulum.angle+=this.pendulum.angleVelocity,this.sphere.position.set(this.pendulum.current.x,this.pendulum.current.y+10.5,0);for(var e,t,i,n,r,o,s=this.sphere.position,a=s.x,h=s.z,d=0;d<this.grid.rows;d++)for(var u=0;u<this.grid.cols;u++){var l=this.meshes[d][u],c=(i=a,n=h,r=l.position.x+this.groupMesh.position.x,o=l.position.z+this.groupMesh.position.z,Math.sqrt(Math.pow(i-r,2)+Math.pow(n-o,2))),p=(t=0)+(c-(e=4.5))/(1-e)*(-1-t),g=p>1?1:p<.001?.001:p;TweenMax.to(l.scale,.3,{ease:Expo.easeOut,y:g})}}},{key:"animate",value:function(){this.controls.update(),this.draw(),this.renderer.render(this.scene,this.camera),requestAnimationFrame(this.animate.bind(this))}}])&&r(t.prototype,i),o&&r(t,o),e}())).init()}]);