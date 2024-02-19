# mesh-outlining
The Object outlining project using shader based post processing technique in babylonjs(WebGL)
# setup
    1. Clone the repository.
    2. Open/Install VSCode.
    3. Install Express server extension in VSCode. 
    4. Run "> Express: Host Current Workspace and open in browser" command.

# Scene Details 
Scene contains,
    1. Camera
    2. Normal meshes(Boxes)
    3. Obj mesh model
    4. Outline Render Target and Shader materials
    5. GUI for controling the Outline Color and Outline Width

# Shader details
As mentioned the project uses post processing technique for oulining the mesh in the scene.
    1. Default Vertex and Fragment Shaders
        a. These Shaders are used to create the default texture material(Flat Materials)
    2. Outline Vertex and Fragment Shaders
        a. It takes two samplers,
            i. 'textureSampler' which holds the default render target texture of the scene.
            ii. 'selectedSampler' which holds the outline render target texture of the selected mesh in using mesh picking approach. 
        b. It has 'textureSize' , 'outlineColor' and 'outlinePixelSize' uniforms. 
        c. The 'outline' function does the following job, 
            i.   It first obtains the color values of the the default texture and selected texture. 
            ii.  if the length of the selected texture color is > 1.0 then the default texture color is returned and assigned to glFragColor. 
            iii. For each pixel based on outlinePixelSize both on x and y direction, the Kernel n[10] is prepared to access adjent pixel colors value using texelFetch. The adjacent pixels are indexed as (-2,-1,0,1,+2) both in x and y direction. 
            iv.  The length of each kernal in n[10] is checked if it is > 1.0 then a factor 'numValid' is incremented by 5.0. 
            v.   Finally, the mixing color values of defaultTexColor and outlineColor based on a factor which is minimum of (1.0 and numValid / 5.0).
            vi.  This result color value is assigned to glFragColor

# Results 
![Alt text](/screenshots/Screenshot%202024-02-19%20at%207.44.57 PM.png?raw=true "Original Default Texture")
![Alt text](/screenshots/Screenshot%202024-02-19%20at%207.46.01 PM.png?raw=true "Floor Outline")
![Alt text](/screenshots/Screenshot%202024-02-19%20at%207.48.00 PM.png?raw=true "Mesh Outline")
