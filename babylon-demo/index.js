
  
const xpos = document.querySelector('.xpos');
const ypos = document.querySelector('.ypos');
const zpos = document.querySelector('.zpos');
const xrot = document.querySelector('.xrot');
const yrot = document.querySelector('.yrot');
const zrot = document.querySelector('.zrot');

let trailingMesh = null;
let swing1 = null;
let swing2 = null;

console.log('ho');




function showWorldAxis(scene, size) {
    var makeTextPlane = function(text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
        var plane = BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
    return plane;
     };
    var axisX = BABYLON.Mesh.CreateLines("axisX", [ 
      BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0), 
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = BABYLON.Mesh.CreateLines("axisY", [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( -0.05 * size, size * 0.95, 0), 
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
        ], scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
        ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
};
  
  
  
  
  const createScene = ((engine, canvas) => {
    // Create a basic BJS Scene object.
    const scene = new BABYLON.Scene(engine);

    // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
    // Target the camera to scene origin.
    const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(400, 400, -500), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 500));
    camera.keysRight.push(68);
    camera.keysLeft.push(65);
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.speed = 40;
    camera.angularSensibility = 1000;

    // Attach the camera to the canvas.
    camera.attachControl(canvas, false);

    // Create a basic light, aiming 0,1,0 - meaning, to the sky.
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);


    // Return the created scene.
    return scene;
});



window.addEventListener('DOMContentLoaded', function() {



    const canvas = document.querySelector('.renderCanvas');

    const engine = new BABYLON.Engine(canvas, true);

    const scene = createScene(engine, canvas);
    console.log(scene);

    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.AmmoJSPlugin());

    const gizmoManager = new BABYLON.GizmoManager(scene)





    const loadObject = (scene) => {


        Promise.all([
        BABYLON.SceneLoader.ImportMeshAsync(null,"./", "TrailingArm.stl", scene).then(function (result) {
            // do something with the scene
            result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotate(BABYLON.Axis.X, -Math.PI/2, BABYLON.Space.WORLD);
            trailingMesh = result.meshes[0];
        }),

        BABYLON.SceneLoader.ImportMeshAsync(null,"./", "SwingLink.stl", scene).then(function (result) {
            // do something with the scene
            result.meshes[0].setPositionWithLocalVector(new BABYLON.Vector3(95.0644212875894, 107.78961983320119, 1100.7949023300482));
            const quat = new BABYLON.Quaternion(0.42484796102370227, 0.5695146424108568, -0.5580240549858019, 0.4346690254791583);
            const euler = quat.toEulerAngles();
            
            //meshes[0].absolutePosition.x = 95.0644212875894;
            //meshes[0].absolutePosition.y = 107.78961983320119;
            //meshes[0].absolutePosition.z = 1100.7949023300482;
            result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotation= new BABYLON.Vector3(euler.x, euler.y, euler.z);
            swing1 = result.meshes[0];
        }),
    
        BABYLON.SceneLoader.ImportMeshAsync(null,"./", "SwingLink.stl", scene).then(function (result) {
            // do something with the scene
            result.meshes[0].setPositionWithLocalVector(new BABYLON.Vector3( 95.06442128758, 5.0475827291262, 1100.7949016772));
            const quat = new BABYLON.Quaternion(0.42484796102370227, 0.5695146424108568, -0.5580240549858019, 0.4346690254791583);
            const euler = quat.toEulerAngles();
            
            //meshes[0].absolutePosition.x = 95.0644212875894;
            //meshes[0].absolutePosition.y = 107.78961983320119;
            //meshes[0].absolutePosition.z = 1100.7949023300482;
            result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotation= new BABYLON.Vector3(euler.x, euler.y, euler.z);
            swing2 = result.meshes[0];
        }),

    ]).then(() => {
        console.log(swing1, swing2, trailingMesh);

        var sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:20}, scene);
        var greenMat = new BABYLON.StandardMaterial("green", scene);
        greenMat.diffuseColor = new BABYLON.Color3.Green();
        sphere1.material = greenMat;
        sphere1.position = new BABYLON.Vector3(486.987951628482,108.5701541370955,994.2733443997791);

        var sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:20}, scene);
        var greenMat = new BABYLON.StandardMaterial("green", scene);
        greenMat.diffuseColor = new BABYLON.Color3.Green();
        sphere2.material = greenMat;
        sphere2.position = new BABYLON.Vector3(486.987951628482,5.56051355935,994.2733443997791);

        var sphere3 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:20}, scene);
        var greenMat = new BABYLON.StandardMaterial("green", scene);
        greenMat.diffuseColor = new BABYLON.Color3.Green();
        sphere3.material = greenMat;
        sphere3.position = new BABYLON.Vector3(0,0,0);


        trailingMesh.physicsImpostor = new BABYLON.PhysicsImpostor(trailingMesh, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 1 }, scene);
        swing1.physicsImpostor = new BABYLON.PhysicsImpostor(swing1, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 1}, scene);
        swing2.physicsImpostor = new BABYLON.PhysicsImpostor(swing2, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 1}, scene);
        sphere1.physicsImpostor = new BABYLON.PhysicsImpostor(sphere1, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0}, scene);
        sphere2.physicsImpostor = new BABYLON.PhysicsImpostor(sphere2, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0}, scene);
        sphere3.physicsImpostor = new BABYLON.PhysicsImpostor(sphere3, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0}, scene);


        const link1ArmJoint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.BallAndSocketJoint, {
            mainPivot: new BABYLON.Vector3(95.0, -1100.794902, 107.78961983320),
            connectedPivot: new BABYLON.Vector3(0, 0, 0),
        }); 

        const link1SphereJoint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.BallAndSocketJoint, {
            mainPivot: new BABYLON.Vector3(0, 0, 0),
            connectedPivot: new BABYLON.Vector3(0, 407, 0),
        }); 


        const link2ArmJoint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.BallAndSocketJoint, {
            mainPivot: new BABYLON.Vector3(95.06442128758,-1100.7949016772 ,5.0475827291262),
            connectedPivot: new BABYLON.Vector3(0, 0, 0),
        }); 

        const link2SphereJoint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.BallAndSocketJoint, {
            mainPivot: new BABYLON.Vector3(0, 0, 0),
            connectedPivot: new BABYLON.Vector3(0, 407, 0),
        }); 

        const armToZeroJoint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.BallAndSocketJoint, {
            mainPivot: new BABYLON.Vector3(0,0,0),
            connectedPivot: new BABYLON.Vector3(0, 0, 0),
        }); 

        trailingMesh.physicsImpostor.addJoint(swing1.physicsImpostor, link1ArmJoint); 
        sphere1.physicsImpostor.addJoint(swing1.physicsImpostor, link1SphereJoint);

        trailingMesh.physicsImpostor.addJoint(swing2.physicsImpostor, link2ArmJoint); 
        sphere2.physicsImpostor.addJoint(swing2.physicsImpostor, link2SphereJoint); 

        trailingMesh.physicsImpostor.addJoint(sphere3.physicsImpostor, armToZeroJoint); 


     
        

        const down = () => {
            var impulseDirection = new BABYLON.Vector3(0, 1, 0);
            var impulseMagnitude = 500;
            var contactLocalRefPoint = new BABYLON.Vector3(0,-600,0);
            trailingMesh.physicsImpostor.applyImpulse(impulseDirection.scale(impulseMagnitude), trailingMesh.getAbsolutePosition().add(contactLocalRefPoint));
        };

        document.querySelector('.down').addEventListener("click", down);

        const up = () => {
            var impulseDirection = new BABYLON.Vector3(0, -1, 0);
            var impulseMagnitude = 500;
            var contactLocalRefPoint = new BABYLON.Vector3(0, -600, 0);
            trailingMesh.physicsImpostor.applyImpulse(impulseDirection.scale(impulseMagnitude), trailingMesh.getAbsolutePosition().add(contactLocalRefPoint));
        };

        document.querySelector('.up').addEventListener("click", up);




    });
    
        
    }

    loadObject();

    // Initialize GizmoManager

    // Initialize all gizmos
    gizmoManager.boundingBoxGizmoEnabled=true;
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;

    

    // Modify gizmos based on keypress
    document.onkeydown = (e)=>{
        if(e.key == 'z' || e.key == 'x'|| e.key == 'c'|| e.key == 'v'){
            // Switch gizmo type
            gizmoManager.positionGizmoEnabled = false;
            gizmoManager.rotationGizmoEnabled = false;
            gizmoManager.scaleGizmoEnabled = false;
            gizmoManager.boundingBoxGizmoEnabled = false;
            if(e.key == 'z'){
                gizmoManager.positionGizmoEnabled = true;
            }
            if(e.key == 'x'){
                gizmoManager.rotationGizmoEnabled = true;
            }
            if(e.key == 'c'){
                gizmoManager.scaleGizmoEnabled = true;
            }
            if(e.key == 'v'){
                gizmoManager.boundingBoxGizmoEnabled = true;
            }
        }
        if(e.key == 'b'){
            // hide the gizmo
            gizmoManager.attachToMesh(null);
        }
        if(e.key == 'n'){
            // Toggle local/global gizmo rotation positioning
            gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = !gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh;
            gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = !gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh;
        }
        if(e.key == 'm'){
            // Toggle distance snapping
            if(gizmoManager.gizmos.scaleGizmo.snapDistance == 0){
                gizmoManager.gizmos.scaleGizmo.snapDistance = 0.3;
                gizmoManager.gizmos.rotationGizmo.snapDistance = 0.3;
                gizmoManager.gizmos.positionGizmo.snapDistance = 0.3;
            }else{
                gizmoManager.gizmos.scaleGizmo.snapDistance = 0;
                gizmoManager.gizmos.rotationGizmo.snapDistance = 0;
                gizmoManager.gizmos.positionGizmo.snapDistance = 0;
            }
        }
        if(e.key == ','){
            // Toggle gizmo size
            if(gizmoManager.gizmos.scaleGizmo.scaleRatio == 1){
                gizmoManager.gizmos.scaleGizmo.scaleRatio = 1.5;
                gizmoManager.gizmos.rotationGizmo.scaleRatio = 1.5;
                gizmoManager.gizmos.positionGizmo.scaleRatio = 1.5;
            }else{
                gizmoManager.gizmos.scaleGizmo.scaleRatio = 1;
                gizmoManager.gizmos.rotationGizmo.scaleRatio = 1;
                gizmoManager.gizmos.positionGizmo.scaleRatio = 1;
            }
        }
    }

    const setReadouts = ((meshpos, meshrot) => {
        if (meshpos) {
        xpos.innerText = `x = ${meshpos.position.x}`
        ypos.innerText = `y = ${meshpos.position.y}`
        zpos.innerText = `z = ${meshpos.position.z}`
        }
        if (meshrot) {
        xrot.innerText = `ROTATION = ${meshrot.rotationQuaternion}`
      
        }
    });

    // Start by only enabling position control
    document.onkeydown({key: "z"})

    gizmoManager.gizmos.positionGizmo.xGizmo.dragBehavior.onDragObservable.add(()=>{
        const meshpos = gizmoManager.gizmos.positionGizmo.attachedMesh;
        const meshrot = gizmoManager.gizmos.rotationGizmo.attachedMesh;
        console.log(scene);

        setReadouts(meshpos, meshrot);

    });
    gizmoManager.gizmos.positionGizmo.yGizmo.dragBehavior.onDragObservable.add(()=>{
        const meshpos = gizmoManager.gizmos.positionGizmo.attachedMesh;
        const meshrot = gizmoManager.gizmos.rotationGizmo.attachedMesh;
        setReadouts(meshpos, meshrot);
    });
    gizmoManager.gizmos.positionGizmo.zGizmo.dragBehavior.onDragObservable.add(()=>{
        const meshpos = gizmoManager.gizmos.positionGizmo.attachedMesh;
        const meshrot = gizmoManager.gizmos.rotationGizmo.attachedMesh;
        setReadouts(meshpos, meshrot);
    });
    gizmoManager.gizmos.rotationGizmo.xGizmo.dragBehavior.onDragObservable.add(()=>{
        const meshpos = gizmoManager.gizmos.positionGizmo.attachedMesh;
        const meshrot = gizmoManager.gizmos.rotationGizmo.attachedMesh;
        setReadouts(meshpos, meshrot);
    });
    gizmoManager.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragObservable.add(()=>{
        const meshpos = gizmoManager.gizmos.positionGizmo.attachedMesh;
        const meshrot = gizmoManager.gizmos.rotationGizmo.attachedMesh;
        setReadouts(meshpos, meshrot);
    });
    gizmoManager.gizmos.rotationGizmo.zGizmo.dragBehavior.onDragObservable.add(()=>{
        const meshpos = gizmoManager.gizmos.positionGizmo.attachedMesh;
        const meshrot = gizmoManager.gizmos.rotationGizmo.attachedMesh;
        setReadouts(meshpos, meshrot);
    });

    showWorldAxis(scene, 200);
    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', function() {
        engine.resize();
    });





});





