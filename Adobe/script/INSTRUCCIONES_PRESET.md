# Guía para crear el archivo 'preset.epr' (Preset de Exportación)

Para que el script pueda exportar los videos de manera automática con el formato vertical y la calidad requerida, debes generar un archivo de Preset (`.epr`) en Adobe Premiere Pro. Sigue estos sencillos pasos:

1. **Abre Adobe Premiere Pro** con cualquier proyecto que tengas.
2. Selecciona cualquier secuencia existente y ve a la pestaña de **Exportar** (en la parte superior de la pantalla) o presiona el atajo `Ctrl + M` (Windows) / `Cmd + M` (Mac) para abrir la ventana de exportación.
3. Configura los parámetros técnicos exactamente como se solicitan:
   * **Formato:** Selecciona `H.264` (esto generará un archivo con extensión `.mp4`).
   * **Resolución de video:** Desmarca la casilla con el icono de candado o casilla "Coincidir con origen" (*Match Source*) e introduce los valores de forma vertical:
     * **Ancho:** `1080`
     * **Alto:** `1920`
   * **Velocidad de fotogramas (Frame Rate):** Ajusta a `30` fps (cuadros por segundo).
   * **Ajustes de Bitrate:** En la pestaña "Video", ve a los ajustes de velocidad y coloca la **Velocidad de bits de destino (Target Bitrate)** en `8.00 Mbps` (esto equivale a los 8000 kbps solicitados).
   * **Audio:** En la pestaña "Audio", asegúrate de que el formato sea `AAC` y la velocidad de bits esté configurada en `128 kbps` (estéreo).
4. **Guarda el Preset:** En la parte superior de la ventana de exportación, al lado del nombre del ajuste preestablecido (Preset), haz clic en el menú desplegable (o el icono de tres puntos) y selecciona **Guardar ajuste preestablecido...** (*Save Preset...*).
5. Ponle un nombre descriptivo, por ejemplo: `Metodo_Miclos_1080x1920`.
6. **Copia el archivo generado:**
   * Premiere guarda estos archivos en tu carpeta personal.
   * En **Windows**, búscalo en: `C:\Usuarios\<TuUsuario>\Documentos\Adobe\Premiere Pro\[Versión]\Profile-CreativeCloud-\Settings\IngestPresets` (o busca archivos terminados en `.epr` en tu carpeta de Documentos).
   * Copia ese archivo y pégalo dentro de la carpeta `script/` de este proyecto con el nombre **`preset.epr`**.

Una vez guardado allí, el script lo detectará y aplicará automáticamente para generar los 720 videos.
