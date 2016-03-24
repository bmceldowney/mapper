var images = [
                          { name: "Wall", src: "tiles/wall.png" },
                          { name: "Alcove", src: "tiles/alcove.png" },
                          { name: "Anti-Magic Zone", src: "tiles/antiMagicZone.png" },
                          { name: "Darkness", src: "tiles/darkness.png" },
                          { name: "Floor Pit", src: "tiles/floorPit.png" },
                          { name: "Illusionary Wall", src: "tiles/illusionaryWall.png" },
                          { name: "Pillar", src: "tiles/pillar.png" },
                          { name: "Stairs Up", src: "tiles/stairsUp.png" },
                          { name: "Stairs Down", src: "tiles/stairsDown.png" },
                          { name: "Ceiling Pit", src: "tiles/cielingPit.png" },
                          { name: "Door", src: "tiles/door.png" },
                          { name: "Floor Plate", src: "tiles/floorPlate.png" },
                          { name: "Invisible Floor Plate", src: "tiles/invisioFloorPlate.png" },
                          { name: "Plaque", src: "tiles/plaque.png" },
                          { name: "Statue", src: "tiles/statue.png" },
                          { name: "Floor/Ceiling Pit", src: "tiles/floorCielingPit.png" },
                          { name: "Fountain", src: "tiles/fountain.png" },
                          { name: "Invisible Teleport", src: "tiles/invisioTeleport.png" },
                          { name: "Removable Wall", src: "tiles/removeableWall.png" },
                          { name: "Removable Wall", src: "tiles/removeableWall2.png" },
                          { name: "Switch", src: "tiles/switch.png" },
                          { name: "Glyph", src: "tiles/glyph.png" },
                          { name: "Locked Door", src: "tiles/lockedDoor.png" },
                          { name: "Teleport", src: "tiles/teleport.png" },
                          { name: "Magical Field", src: "tiles/magicField.png" },
                          { name: "Monster Generator", src: "tiles/MonsterGenerator.png" },
                          { name: "Special Panel", src: "tiles/specialPanel.png" },
                          { name: "Trap", src: "tiles/trap.png" },
                          { name: "One-Way Wall", src: "tiles/oneWayWall.png" },
                          { name: "Spinner", src: "tiles/spinner.png" },
                          { name: "Monster 1", src: "tiles/Monster.png" },
                          { name: "Monster 2", src: "tiles/Monster2.png" },
                          { name: "Monster 3", src: "tiles/Monster3.png" },
                          { name: "Monster 4", src: "tiles/Monster4.png" },
                          ];

function Tile(image) {
    this.name = image.name;
    this.src = image.src;
    this.rotation = 0;
    this.tileImageIndex = image.tileImageIndex;
}