//Scene and Engine related
var canvas = document.getElementById("canvas");
var engine = new BABYLON.Engine(canvas,true);
var scene;
var camera;

//Shader related
var defaultMaterial;
var outlineRenderTarget;
var outlineRenderTargetMaterial;

//User Interactions related
var pickeObjInfoLabel;

//User Interactions Variables
var outLineColor = new BABYLON.Vector3(1.0,1.0,1.0);
var outlinePixelSize = 1.0;

/*
    Adding camera to the scene. Camera is configured as Arcball camera which is attached to active scene.
*/
function CameraCreation()
{
    //Arc Ball Camera
	camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 100, BABYLON.Vector3.Zero(), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    scene.activeCameras.push(camera);
    //Attach the camera to the canvas
    camera.attachControl(canvas, true);
}

/*
    Adding Global illumination to the scene.
*/
function LightCreation()
{
    //Hemisphere White light
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 50, 0), scene);
    light.diffuse = new BABYLON.Color3(1.0,1.0,1.0);
}

/*
    Adding basic Boxes of different dimensions to the scene which overlaps.
*/
function BasicObjectsCreation()
{
    //Floor Object
    var floorObj = BABYLON.MeshBuilder.CreateBox("floor");
    floorObj.position = new BABYLON.Vector3(0,0,0);
    floorObj.scaling = new BABYLON.Vector3(50,0.1,50);

    //Floor Object's Material
    var floorObjMaterial = new BABYLON.StandardMaterial("floorObjMaterial", scene);
    floorObjMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Gray color
    floorObj.material = floorObjMaterial;

    //Boxes Materials in Red, Green, Blue, Yellow
    var redMat = new BABYLON.StandardMaterial("redMat", scene);
	redMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
	
	var greenMat = new BABYLON.StandardMaterial("greenMat", scene);
	greenMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
	
	var blueMat = new BABYLON.StandardMaterial("blueMat", scene);
	blueMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
	
	var yellowMat = new BABYLON.StandardMaterial("yellowMat", scene);
	yellowMat.diffuseColor = new BABYLON.Color3(1, 1, 0);

    //Red Box
    var boxObj1 = BABYLON.MeshBuilder.CreateBox("box1");
    boxObj1.position = new BABYLON.Vector3(0,3,0);
    boxObj1.scaling = new BABYLON.Vector3(6,6,6);
    boxObj1.material = redMat;

    //Green Box
    var boxObj2 = BABYLON.MeshBuilder.CreateBox("box2");
    boxObj2.position = new BABYLON.Vector3(-4,4,-5);
    boxObj2.scaling = new BABYLON.Vector3(10,6,5);
    boxObj2.material = greenMat;

    //Blue Box
    var boxObj3 = BABYLON.MeshBuilder.CreateBox("box3");
    boxObj3.position = new BABYLON.Vector3(5,8,-4);
    boxObj3.scaling = new BABYLON.Vector3(10,10,6);
    boxObj3.material = blueMat;

    //Yellow Box
    var boxObj4 = BABYLON.MeshBuilder.CreateBox("box4");
    boxObj4.position = new BABYLON.Vector3(-3,6,0);
    boxObj4.scaling = new BABYLON.Vector3(2,10,3);
    boxObj4.material = yellowMat;
}

/*
    Adding Mesh(Toy train) obj and its materials to the scene, which overlaps with the basic boxes which are already present in the scene. 
*/
function MeshObjectCreation()
{
    //Load the OBJ model
    BABYLON.SceneLoader.ImportMesh("", "3dmodel/", "11709_train_v1_L3.obj", scene, function (meshes) {
        // Adjusting the position, rotation, and scaling
        meshes.forEach(function(mesh) { 
            mesh.position = new BABYLON.Vector3(2, 5, -2);
            mesh.rotation = new BABYLON.Vector3(BABYLON.Tools.ToRadians(-90), 0, 0);
            mesh.scaling = new BABYLON.Vector3(2, 3, 3);
            console.log(mesh.name);
        });
});
}

/*
    Creation of Outline Render target texture which is passed to the outline shader for processing.
*/
function OutlineRenderTargetCreation()
{
    //Render Target Texture creation for Outlining
    outlineRenderTarget = new BABYLON.RenderTargetTexture(
        'outline texture',
        {width: engine.getRenderWidth(),height: engine.getRenderHeight()},
        scene);

    outlineRenderTarget.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 1.0);
    outlineRenderTarget.activeCamera = scene.activeCamera;;
    scene.customRenderTargets.push(outlineRenderTarget);
}

/*
    Creation of Shader materials
    1. Default shader material for the whole scene. 
    2. Outline shader material for the job of outlining the selected meshes. 
*/
function ShaderMaterialCreation()
{
    //default shader material
    defaultMaterial = new BABYLON.ShaderMaterial('normal', scene, './DEFAULT', {
        attributes: ['position','uv'],
        uniforms: ['worldViewProjection'],
        });

    //outline shader material
    outlineRenderTargetMaterial = new BABYLON.ShaderMaterial('outline', scene, './OUTLINE',{
        attributes: ['position', 'uv'],
        uniforms: ['worldViewProjection', 'textureSampler', 'textureSize', 'outlineColor', 'outlineWidth'],
        });
}

/*
    Handling the picking of meshes using scene's onPointerObservable event. 
    1. The picked object is added to the renderlist of outlineRenderTarget texture. At a time it can contain only one texture.
    2. Updating the pickeObjInfoLabel to show the mesh name which is selected.
*/
function HandleObjectPickingInScene()
{
    // Enable object picking
    scene.onPointerObservable.add(function (eventData) {
        if(eventData.type == BABYLON.PointerEventTypes.POINTERMOVE)
        {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) 
            {
                var pickedObjName = pickResult.pickedMesh.name;
                // Update the label text with the picked object's name in pickeObjInfoLabel
                pickeObjInfoLabel.text = "Picked Object: " + pickedObjName;
                outlineRenderTarget.renderList.pop();
                if (pickResult.pickedMesh)
                {
                    //Push the picked object in the outlineRenderTarget 
                    outlineRenderTarget.renderList.push(pickResult.pickedMesh);
                    outlineRenderTarget.setMaterialForRendering(pickResult.pickedMesh, defaultMaterial);
                }
            }
        }
    });
}

/*
    Outlining is handled via post processing outline shader.
    1. Takes two textures 1.textureSampler(Default) 2.selectedSampler(Mesh which is picked by user)
    2. Also sets the shader uniforms for processing.
*/
function OutlinePostProcessing()
{
    //Post processing Filter pass Creation
    //Takes two textures 1.textureSampler(Default) 2.selectedSampler(Mesh which is picked by user) 
    var outlineFilterPass = new BABYLON.PostProcess(
    'outline pass',
    './OUTLINE', // shader
    ['textureSize', 'outlineColor', 'outlinePixelSize'], // attributes
    ['textureSampler', 'selectedSampler'], // textures
    1.0, // options
    camera, // camera
    BABYLON.Texture.BILINEAR_SAMPLINGMODE, // sampling
    engine, // engine
    );

    //Pass the values to the uniforms for Outline Shader
    outlineFilterPass.onApply = effect => {
        console.log("This Executed Next")
        effect.setTexture(
            'selectedSampler',
            outlineRenderTarget
        );
        effect.setVector3(
            'outlineColor',
            outLineColor,
        );
        effect.setFloat(
            'outlinePixelSize',
            outlinePixelSize,
        );
        effect.setVector2(
            'textureSize', 
            new BABYLON.Vector2(engine.getRenderWidth(true), engine.getRenderHeight(true)));
    };
}

/*
    GUI creation for controlling the Outline Color and Outline width.
*/
function HandleUserInteractions()
{    
    //Dynamic Texture Creation for adding UI elements
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    //pickeObjInfoLabel shows the User selected mesh name
    pickeObjInfoLabel = new BABYLON.GUI.TextBlock();
    pickeObjInfoLabel.text = "Picked Object:";
    pickeObjInfoLabel.color = "white";
    pickeObjInfoLabel.fontSize = 20;
    pickeObjInfoLabel.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    pickeObjInfoLabel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    pickeObjInfoLabel.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    pickeObjInfoLabel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(pickeObjInfoLabel);  

    //Stack panel to vertically stack the Color Picker and Slider
    var stackPanel = new BABYLON.GUI.StackPanel();
    stackPanel.width = "300px";
    stackPanel.isVertical = true;
    stackPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(stackPanel);

    //Text Block for Color Picker Control
    var outlineColorTextBlock = new BABYLON.GUI.TextBlock();
    outlineColorTextBlock.text = "Outline Color Selection";
    outlineColorTextBlock.height = "15px";
    outlineColorTextBlock.color = "white";
    stackPanel.addControl(outlineColorTextBlock);

    //Blank spacer1 between Color Picker Text Block and Color Picker Control
    var blankSpacer = new BABYLON.GUI.Rectangle();
    blankSpacer.height = "5px";
    blankSpacer.background = "transparent";
    blankSpacer.thickness = 0;
    stackPanel.addControl(blankSpacer);

    //Color Picker for Outline Color
    var colorPicker = new BABYLON.GUI.ColorPicker();
    colorPicker.height = "120px";
    colorPicker.width = "90px";
    colorPicker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    colorPicker.onValueChangedObservable.add(function(value) { 
        outLineColor = new BABYLON.Vector4(value.r,value.g,value.b);
    });
    stackPanel.addControl(colorPicker);

    //Blank spacer2 between Color Picker Control and Text Block of Slider Control
    var blankSpacer2 = new BABYLON.GUI.Rectangle();
    blankSpacer2.height = "5px";
    blankSpacer2.background = "transparent";
    blankSpacer2.thickness = 0;
    stackPanel.addControl(blankSpacer2);

    //Text Block for Slider Control
    var outlineThicknessTextBlock = new BABYLON.GUI.TextBlock();
    outlineThicknessTextBlock.text = "Outline Thickness:";
    outlineThicknessTextBlock.height = "15px";
    outlineThicknessTextBlock.color = "white";
    stackPanel.addControl(outlineThicknessTextBlock); 

    //Blank spacer3 between Slider Text Block and Slider Control
    var blankSpacer3 = new BABYLON.GUI.Rectangle();
    blankSpacer3.height = "5px";
    blankSpacer3.background = "transparent";
    blankSpacer3.thickness = 0;
    stackPanel.addControl(blankSpacer3);

    //Slider Control for Outline Size varies from 0.0 to 2.5
    var outlineSlider = new BABYLON.GUI.Slider();
    outlineSlider.minimum = 0.0;
    outlineSlider.maximum = 2.5;
    outlineSlider.value = outlinePixelSize;
    outlineSlider.height = "20px";
    outlineSlider.width = "100px";
    outlineSlider.onValueChangedObservable.add(function(value) {
        outlinePixelSize = (Number)(value);
        outlineThicknessTextBlock.text = "Outline Thickness: " + outlinePixelSize.toFixed(2) + "px";
    });
    stackPanel.addControl(outlineSlider);
}

//Scene Creation
function SceneCreation()
{
    //Scene Creation
    scene = new BABYLON.Scene(engine);
    scene.clearColor =  new BABYLON.Color4(0.2, 0.2, 0.2, 1);

    //Call to functions which are responsible for various activities
    CameraCreation();
    LightCreation();
    BasicObjectsCreation();
    OutlineRenderTargetCreation();
    MeshObjectCreation();
    HandleObjectPickingInScene();
    ShaderMaterialCreation();
    OutlinePostProcessing();
    HandleUserInteractions();

    return scene;
}

//DOMContentLoaded Event Listener
window.addEventListener("DOMContentLoaded",function(){
    scene = SceneCreation();
    engine.runRenderLoop(function(){
        scene.render();
    }); 
});

//Engine Resize Event Listener
window.addEventListener("resize", function () {
    engine.resize();
});
