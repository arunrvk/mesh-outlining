# mesh-outlining
The Object outlining project using shader based post processing technique in babylonjs(WebGL)
# setup
    1. Clone the repository.
    2. Open/Install VSCode.
    3. Install Express server extension in VSCode. 
    4. Run "> Express: Host Current Workspace and open in browser" command.

# Scene Details 
  Scene contains,\
      1. Camera\
      2. Normal meshes(Boxes)\
      3. Obj mesh model\
      4. Outline Render Target and Shader materials\
      5. GUI for controling the Outline Color and Outline Width\

# Shader details
  As mentioned the project uses post processing technique for oulining the mesh in the scene.\
  \
      &emsp;1. Default Vertex and Fragment Shaders\
          &emsp;&emsp;a. These Shaders are used to create the default texture material(Flat Materials)
          \
      &emsp;2. Outline Vertex and Fragment Shaders
      \
          &emsp;&emsp;a. It takes two samplers,
          \
              &emsp;&emsp;&emsp;&emsp;i. 'textureSampler' which holds the default render target texture of the scene.
              \
              &emsp;&emsp;&emsp;&emsp;ii. 'selectedSampler' which holds the outline render target texture of the selected mesh in using
              \
              &emsp;&emsp;&emsp;&emsp;mesh picking approach.
              \
          &emsp;&emsp;b. It has 'textureSize' , 'outlineColor' and 'outlinePixelSize' uniforms.
          \
          &emsp;&emsp;c. The 'outline' function does the following job,
          \
              &emsp;&emsp;&emsp;&emsp;1. It first obtains the color values of the the default texture and selected texture.
              \
              &emsp;&emsp;&emsp;&emsp;2. If the length of the selected texture color is > 1.0 then the default texture color is returned and assigned
              \
              &emsp;&emsp;&emsp;&emsp;to glFragColor.
              \
              &emsp;&emsp;&emsp;&emsp;3. For each pixel based on outlinePixelSize both on x and y direction, the Kernel n[10] is prepared to access adjent pixel
              \
              &emsp;&emsp;&emsp;&emsp;colors value using texelFetch. The adjacent pixels are indexed as (-2,-1,0,1,+2) both in x and y direction.
              \
              &emsp;&emsp;&emsp;&emsp;4. The length of each kernal in n[10] is checked if it is > 1.0 then a factor 'numValid' is incremented by 5.0.
              \ 
              &emsp;&emsp;&emsp;&emsp;5. Finally, the mixing color values of defaultTexColor and outlineColor based on a factor which is minimum of (1.0 and
              \ 
              &emsp;&emsp;&emsp;&emsp;numValid / 5.0).
              \
              &emsp;&emsp;&emsp;&emsp;6. This result color value is assigned to glFragColor.
              \

# Results 
![Alt text](/screenshots/Screenshot%202024-02-19%20at%207.44.57 PM.png?raw=true "Original Default Texture")
![Alt text](/screenshots/Screenshot%202024-02-19%20at%207.46.01 PM.png?raw=true "Floor Outline")
![Alt text](/screenshots/Screenshot%202024-02-19%20at%207.48.00 PM.png?raw=true "Mesh Outline")
