// ============================================================================
// GENERADOR AUTOMÁTICO DE VARIANTES DE VIDEO - MÉTODO MICLOS
// Desarrollado nativamente para Adobe Premiere Pro (ExtendScript)
// ============================================================================

#target premiere

(function() {
    // ------------------------------------------------------------------------
    // 1. CONFIGURACIÓN E INICIALIZACIÓN
    // ------------------------------------------------------------------------
    var scriptFile = new File($.fileName);
    var scriptFolder = scriptFile.parent;
    var configFilePath = scriptFolder.fsName + "/config_generator.txt";
    
    // Cargar configuración guardada o usar valores por defecto
    var config = loadConfig();
    
    // Auto-detectar carpeta raíz si el script está en Método_Miclos_Proyecto/script/
    if (config.rootFolder === "") {
        var parentFolder = scriptFolder.parent;
        if (parentFolder.exists && new Folder(parentFolder.fsName + "/01_HOOKS").exists) {
            config.rootFolder = parentFolder.fsName;
            config.outputFolder = parentFolder.fsName + "/04_SALIDA";
            var defaultPreset = new File(scriptFolder.fsName + "/preset.epr");
            if (defaultPreset.exists) {
                config.presetPath = defaultPreset.fsName;
            }
        }
    }

    // ------------------------------------------------------------------------
    // 2. CONSTRUCCIÓN DE INTERFAZ GRÁFICA (ScriptUI)
    // ------------------------------------------------------------------------
    var win = new Window("dialog", "Generador Método Miclos - Configuración");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 16;

    // Panel de Rutas
    var pnlPaths = win.add("panel", undefined, "Rutas de Archivos");
    pnlPaths.orientation = "column";
    pnlPaths.alignChildren = ["fill", "top"];
    pnlPaths.spacing = 8;
    pnlPaths.margins = 12;

    // Carpeta Raíz
    var grpRoot = pnlPaths.add("group");
    grpRoot.orientation = "row";
    grpRoot.add("statictext", [0, 0, 100, 20], "Carpeta Raíz:");
    var txtRoot = grpRoot.add("edittext", [0, 0, 300, 20], config.rootFolder);
    var btnRoot = grpRoot.add("button", undefined, "Buscar...");

    // Carpeta Salida
    var grpOutput = pnlPaths.add("group");
    grpOutput.orientation = "row";
    grpOutput.add("statictext", [0, 0, 100, 20], "Carpeta Salida:");
    var txtOutput = grpOutput.add("edittext", [0, 0, 300, 20], config.outputFolder);
    var btnOutput = grpOutput.add("button", undefined, "Buscar...");

    // Archivo Preset (.epr)
    var grpPreset = pnlPaths.add("group");
    grpPreset.orientation = "row";
    grpPreset.add("statictext", [0, 0, 100, 20], "Preset (.epr):");
    var txtPreset = grpPreset.add("edittext", [0, 0, 300, 20], config.presetPath);
    var btnPreset = grpPreset.add("button", undefined, "Buscar...");

    // Panel de Cantidades y Rangos
    var pnlCounts = win.add("panel", undefined, "Cantidades y Rangos");
    pnlCounts.orientation = "column";
    pnlCounts.alignChildren = ["fill", "top"];
    pnlCounts.spacing = 8;
    pnlCounts.margins = 12;

    var grpNums = pnlCounts.add("group");
    grpNums.orientation = "row";
    grpNums.spacing = 20;

    // Cantidad HOOKs
    var grpHooks = grpNums.add("group");
    grpHooks.add("statictext", undefined, "HOOKs Totales:");
    var txtHooksCount = grpHooks.add("edittext", [0, 0, 50, 20], config.hooksCount);

    // Cantidad MIDs
    var grpMids = grpNums.add("group");
    grpMids.add("statictext", undefined, "MIDs:");
    var txtMidsCount = grpMids.add("edittext", [0, 0, 40, 20], config.midsCount);

    // Cantidad CTAs
    var grpCtas = grpNums.add("group");
    grpCtas.add("statictext", undefined, "CTAs:");
    var txtCtasCount = grpCtas.add("edittext", [0, 0, 40, 20], config.ctasCount);

    // Rango de HOOKs a Procesar
    var grpRange = pnlCounts.add("group");
    grpRange.orientation = "row";
    grpRange.add("statictext", undefined, "Procesar Rango de HOOKs - Desde:");
    var txtHooksStart = grpRange.add("edittext", [0, 0, 50, 20], config.hooksStart);
    grpRange.add("statictext", undefined, "Hasta:");
    var txtHooksEnd = grpRange.add("edittext", [0, 0, 50, 20], config.hooksEnd);

    // Panel de Opciones
    var pnlOptions = win.add("panel", undefined, "Opciones de Ejecución");
    pnlOptions.orientation = "column";
    pnlOptions.alignChildren = ["left", "top"];
    pnlOptions.spacing = 8;
    pnlOptions.margins = 12;

    var chkScale = pnlOptions.add("checkbox", undefined, "Escalar videos automáticamente al tamaño de la secuencia (1080x1920)");
    chkScale.value = config.scaleToFit;

    var chkOverwrite = pnlOptions.add("checkbox", undefined, "Sobrescribir videos existentes (Desmarcar para Reanudar)");
    chkOverwrite.value = config.overwrite;

    var grpSpace = pnlOptions.add("group");
    grpSpace.orientation = "row";
    grpSpace.add("statictext", undefined, "Espacio mínimo en disco para seguridad:");
    var txtMinDiskSpace = grpSpace.add("edittext", [0, 0, 50, 20], config.minDiskSpace);
    grpSpace.add("statictext", undefined, "GB");

    // Botones de Acción
    var grpActions = win.add("group");
    grpActions.orientation = "row";
    grpActions.alignment = "right";
    var btnCancel = grpActions.add("button", undefined, "Cancelar", {name: "cancel"});
    var btnStart = grpActions.add("button", undefined, "Iniciar Generación", {name: "ok"});

    // ------------------------------------------------------------------------
    // 3. CONTROLADORES DE EVENTOS Y DETECCIÓN AUTOMÁTICA DE CARPETAS
    // ------------------------------------------------------------------------
    
    // Función para detectar la cantidad de archivos reales en cada carpeta y rellenar los campos
    function updateCountsFromFolder(rootPath) {
        var detectedHooks = getFileCountInFolder(rootPath + "/01_HOOKS", "HOOK");
        var detectedMids = getFileCountInFolder(rootPath + "/02_MIDS", "MID");
        var detectedCtas = getFileCountInFolder(rootPath + "/03_CTAS", "CTA");

        if (detectedHooks > 0) {
            txtHooksCount.text = detectedHooks + "";
            txtHooksStart.text = "1";
            txtHooksEnd.text = detectedHooks + "";
        } else {
            // Mantener valores de config/defecto si no se detecta nada
            txtHooksCount.text = config.hooksCount;
            txtHooksStart.text = config.hooksStart;
            txtHooksEnd.text = config.hooksEnd;
        }

        if (detectedMids > 0) {
            txtMidsCount.text = detectedMids + "";
        } else {
            txtMidsCount.text = config.midsCount;
        }

        if (detectedCtas > 0) {
            txtCtasCount.text = detectedCtas + "";
        } else {
            txtCtasCount.text = config.ctasCount;
        }
    }

    // Inicializar los campos con auto-detección al abrir
    if (txtRoot.text !== "") {
        updateCountsFromFolder(txtRoot.text);
    }

    btnRoot.onClick = function() {
        var defaultFolder = new Folder(txtRoot.text);
        if (!defaultFolder.exists) defaultFolder = Folder.current;
        var sel = Folder.selectDialog("Selecciona la carpeta raíz del proyecto", defaultFolder);
        if (sel) {
            txtRoot.text = sel.fsName;
            if (txtOutput.text === "" || txtOutput.text.indexOf("04_SALIDA") !== -1) {
                txtOutput.text = sel.fsName + "/04_SALIDA";
            }
            var presetTest = new File(sel.fsName + "/script/preset.epr");
            if (presetTest.exists) {
                txtPreset.text = presetTest.fsName;
            }
            // Auto-detectar tras cambiar de carpeta raíz
            updateCountsFromFolder(sel.fsName);
        }
    };

    btnOutput.onClick = function() {
        var defaultFolder = new Folder(txtOutput.text);
        if (!defaultFolder.exists) defaultFolder = Folder.current;
        var sel = Folder.selectDialog("Selecciona la carpeta de salida", defaultFolder);
        if (sel) {
            txtOutput.text = sel.fsName;
        }
    };

    btnPreset.onClick = function() {
        var sel = File.openDialog("Selecciona el Preset de Premiere (.epr)", "Preset de Premiere:*.epr", false);
        if (sel) {
            txtPreset.text = sel.fsName;
        }
    };

    // ------------------------------------------------------------------------
    // 4. LÓGICA DE VALIDACIÓN E INICIO
    // ------------------------------------------------------------------------
    btnStart.onClick = function() {
        // Validar rutas
        var rootF = new Folder(txtRoot.text);
        if (!rootF.exists) {
            alert("Error: La carpeta raíz del proyecto no existe.");
            return;
        }
        
        var presetF = new File(txtPreset.text);
        if (!presetF.exists) {
            alert("Error: El archivo de Preset (.epr) no existe.");
            return;
        }

        // Crear carpeta de salida si no existe
        var outputF = new Folder(txtOutput.text);
        if (!outputF.exists) {
            if (!outputF.create()) {
                alert("Error: No se pudo crear la carpeta de salida.");
                return;
            }
        }

        // Validar carpetas de entrada
        var hooksF = new Folder(txtRoot.text + "/01_HOOKS");
        var midsF = new Folder(txtRoot.text + "/02_MIDS");
        var ctasF = new Folder(txtRoot.text + "/03_CTAS");
        if (!hooksF.exists || !midsF.exists || !ctasF.exists) {
            alert("Error: No se encontraron las subcarpetas requeridas (01_HOOKS, 02_MIDS, 03_CTAS) dentro de la carpeta raíz.");
            return;
        }

        // Validar cantidades
        var hooksCount = parseInt(txtHooksCount.text, 10);
        var midsCount = parseInt(txtMidsCount.text, 10);
        var ctasCount = parseInt(txtCtasCount.text, 10);
        var hooksStart = parseInt(txtHooksStart.text, 10);
        var hooksEnd = parseInt(txtHooksEnd.text, 10);
        var minDiskSpace = parseFloat(txtMinDiskSpace.text);

        if (isNaN(hooksCount) || hooksCount < 1 || hooksCount > 500 ||
            isNaN(midsCount) || midsCount < 1 || midsCount > 50 ||
            isNaN(ctasCount) || ctasCount < 1 || ctasCount > 50) {
            alert("Error: Las cantidades de clips ingresadas no son válidas.\nLímites: HOOKs (1-500), MIDs (1-50), CTAs (1-50).");
            return;
        }

        if (isNaN(hooksStart) || isNaN(hooksEnd) || hooksStart < 1 || hooksEnd < hooksStart || hooksEnd > hooksCount) {
            alert("Error: El rango de HOOKs a procesar no es válido.");
            return;
        }

        if (isNaN(minDiskSpace) || minDiskSpace < 0) {
            minDiskSpace = 50;
        }

        // Guardar configuración actual para la próxima ejecución
        config = {
            rootFolder: txtRoot.text,
            outputFolder: txtOutput.text,
            presetPath: txtPreset.text,
            hooksCount: txtHooksCount.text,
            midsCount: txtMidsCount.text,
            ctasCount: txtCtasCount.text,
            hooksStart: txtHooksStart.text,
            hooksEnd: txtHooksEnd.text,
            scaleToFit: chkScale.value,
            overwrite: chkOverwrite.value,
            minDiskSpace: txtMinDiskSpace.text
        };
        saveConfig(config);

        // Cerrar ventana de configuración e indicar éxito
        win.close(1);
    };

    // Mostrar ventana
    if (win.show() !== 1) {
        return; // Usuario canceló la configuración
    }

    // ------------------------------------------------------------------------
    // 5. PROCESAMIENTO PRINCIPAL (POST-CONFIGURACIÓN)
    // ------------------------------------------------------------------------
    var rootPath = config.rootFolder;
    var outputPath = config.outputFolder;
    var presetPath = config.presetPath;
    
    var hCount = parseInt(config.hooksCount, 10);
    var mCount = parseInt(config.midsCount, 10);
    var cCount = parseInt(config.ctasCount, 10);
    var hStart = parseInt(config.hooksStart, 10);
    var hEnd = parseInt(config.hooksEnd, 10);
    var minSpace = parseFloat(config.minDiskSpace);
    var scaleToFit = config.scaleToFit;
    var overwrite = config.overwrite;

    // Verificar espacio en disco
    var freeSpace = getFreeSpaceGB(outputPath);
    if (freeSpace !== -1 && freeSpace < minSpace) {
        var proceedSpace = confirm("¡ADVERTENCIA DE ESPACIO!\nEl espacio libre en el disco de destino (" + freeSpace.toFixed(1) + " GB) es inferior al límite de seguridad configurado (" + minSpace + " GB).\n¿Deseas continuar bajo tu propio riesgo?");
        if (!proceedSpace) {
            return;
        }
    }

    // Escanear y mapear archivos
    var hookFiles = scanFolderForFiles(rootPath + "/01_HOOKS", "HOOK", hCount);
    var midFiles = scanFolderForFiles(rootPath + "/02_MIDS", "MID", mCount);
    var ctaFiles = scanFolderForFiles(rootPath + "/03_CTAS", "CTA", cCount);

    // Validar si hay archivos faltantes en el rango
    var missingFiles = [];
    for (var h = hStart; h <= hEnd; h++) {
        if (!hookFiles[h]) missingFiles.push("HOOK_" + padZero(h, 3) + "_EDITADO.mp4");
    }
    for (var m = 1; m <= mCount; m++) {
        if (!midFiles[m]) missingFiles.push("MID_" + m + "_EDITADO.mp4");
    }
    for (var c = 1; c <= cCount; c++) {
        if (!ctaFiles[c]) missingFiles.push("CTA_" + c + "_EDITADO.mp4");
    }

    if (missingFiles.length > 0) {
        var maxShow = 5;
        var missingMsg = "Faltan los siguientes archivos en las carpetas de origen:\n";
        for (var i = 0; i < Math.min(missingFiles.length, maxShow); i++) {
            missingMsg += "- " + missingFiles[i] + "\n";
        }
        if (missingFiles.length > maxShow) {
            missingMsg += "... y " + (missingFiles.length - maxShow) + " archivos más.\n";
        }
        missingMsg += "\n¿Deseas continuar? Se omitirán automáticamente las combinaciones que dependan de estos archivos.";
        var proceedMissing = confirm(missingMsg);
        if (!proceedMissing) {
            return;
        }
    }

    // Advertencia de cierre de proyecto
    if (app.project) {
        var proceedClose = confirm("El script necesita abrir y cerrar proyectos de Premiere de forma automática. El proyecto activo actual se cerrará sin guardar.\n¿Deseas continuar?");
        if (!proceedClose) {
            return;
        }
        app.project.closeDocument(0, 0); // Cerrar proyecto inicial
    }

    // Calcular combinaciones totales
    var activeHooks = hEnd - hStart + 1;
    var totalCombinations = activeHooks * mCount * cCount;

    // Crear ventana de progreso
    var progWin = new Window("palette", "Procesando Variantes de Video");
    progWin.orientation = "column";
    progWin.alignChildren = ["fill", "top"];
    progWin.spacing = 10;
    progWin.margins = 16;

    var lblStatus = progWin.add("statictext", [0, 0, 350, 40], "Inicializando proceso combinatorio...");
    var progBar = progWin.add("progressbar", [0, 0, 350, 15], 0, totalCombinations);
    
    var grpTimes = progWin.add("group");
    grpTimes.orientation = "row";
    grpTimes.alignment = "fill";
    var lblElapsed = grpTimes.add("statictext", undefined, "Tiempo Transcurrido: 00:00:00");
    grpTimes.add("statictext", undefined, " | ");
    var lblRemaining = grpTimes.add("statictext", undefined, "Tiempo Restante: calculando...");

    var btnCancelProc = progWin.add("button", undefined, "Cancelar Generación");
    var isCancelled = false;
    btnCancelProc.onClick = function() {
        isCancelled = true;
        btnCancelProc.enabled = false;
        lblStatus.text = "Cancelando de forma segura al finalizar el render actual...";
    };

    progWin.show();
    progWin.update();

    var logFile = new File(rootPath + "/log_ejecucion.txt");
    writeLog(logFile, "======================================================================");
    writeLog(logFile, "INICIO DE PROCESAMIENTO - MÉTODO MICLOS");
    writeLog(logFile, "Total de combinaciones objetivo: " + totalCombinations);
    writeLog(logFile, "======================================================================");

    var startTime = new Date().getTime();
    var processedCount = 0;
    var skippedCount = 0;
    var errorCount = 0;

    // Triple bucle anidado
    for (var h = hStart; h <= hEnd; h++) {
        if (isCancelled) break;
        var hookFile = hookFiles[h];
        if (!hookFile) continue; // Saltar si falta el archivo

        for (var m = 1; m <= mCount; m++) {
            if (isCancelled) break;
            var midFile = midFiles[m];
            if (!midFile) continue;

            for (var c = 1; c <= cCount; c++) {
                if (isCancelled) break;
                var ctaFile = ctaFiles[c];
                if (!ctaFile) continue;

                processedCount++;

                var hookStr = padZero(h, 3);
                var outName = "HOOK_" + hookStr + "_MID_" + m + "_CTA_" + c + ".mp4";
                var outPath = outputPath + "/" + outName;
                var outFile = new File(outPath);

                // Comprobar si ya existe (para reanudar)
                if (outFile.exists && !overwrite) {
                    skippedCount++;
                    var pct = Math.round((processedCount / totalCombinations) * 100);
                    lblStatus.text = "Omitiendo: " + outName + " (Ya existe)";
                    progBar.value = processedCount;
                    progWin.update();
                    writeLog(logFile, "[OMITIDO] " + outName + " ya existe en destino.");
                    continue;
                }

                // Renderizar combinación
                lblStatus.text = "Procesando (" + processedCount + "/" + totalCombinations + "): " + outName;
                progBar.value = processedCount;
                
                // Actualizar tiempos en la UI
                var now = new Date().getTime();
                var elapsedSec = Math.round((now - startTime) / 1000);
                lblElapsed.text = "Transcurrido: " + formatDuration(elapsedSec);
                
                var itemsProcessedReal = processedCount - skippedCount - errorCount;
                if (itemsProcessedReal > 0) {
                    var avgTimePerItem = (elapsedSec - (skippedCount * 0.1)) / itemsProcessedReal; // Descontar tiempo insignificante de los saltados
                    if (avgTimePerItem > 0) {
                        var remainingItems = totalCombinations - processedCount;
                        var remainingSec = Math.round(avgTimePerItem * remainingItems);
                        lblRemaining.text = "Restante: " + formatDuration(remainingSec);
                    }
                }
                progWin.update();

                var itemRenderStart = new Date().getTime();
                var renderResult = renderCombination(hookFile, midFile, ctaFile, outPath, presetPath, scaleToFit);
                var itemRenderEnd = new Date().getTime();

                if (renderResult.success) {
                    var itemDurSec = Math.round((itemRenderEnd - itemRenderStart) / 1000);
                    writeLog(logFile, "[ÉXITO] Video generado: " + outName + " en " + itemDurSec + "s.");
                } else {
                    errorCount++;
                    writeLog(logFile, "[ERROR] Falló la generación de: " + outName + ". Detalle: " + renderResult.error);
                }
            }
        }
    }

    // Finalizar proceso
    progWin.close();
    
    var totalTimeSec = Math.round((new Date().getTime() - startTime) / 1000);
    writeLog(logFile, "======================================================================");
    writeLog(logFile, "RESUMEN DE EJECUCIÓN:");
    writeLog(logFile, "Total procesado: " + processedCount);
    writeLog(logFile, "Videos generados con éxito: " + (processedCount - skippedCount - errorCount));
    writeLog(logFile, "Videos omitidos (ya existentes): " + skippedCount);
    writeLog(logFile, "Errores: " + errorCount);
    writeLog(logFile, "Tiempo total: " + formatDuration(totalTimeSec));
    writeLog(logFile, "======================================================================");

    if (isCancelled) {
        alert("Generación pausada/cancelada por el usuario.\nProgreso guardado. Puedes volver a ejecutar el script para reanudar.");
    } else {
        alert("¡Procesamiento completo!\nSe generaron las variantes exitosamente.\nConsulta log_ejecucion.txt para más detalles.");
    }

    // ------------------------------------------------------------------------
    // 6. FUNCIONES AUXILIARES
    // ------------------------------------------------------------------------
    
    // Función para renderizar una combinación de videos en una secuencia temporal
    function renderCombination(hook, mid, cta, outPath, preset, scaleClips) {
        var tempProjName = "miclos_temp_" + new Date().getTime() + ".prproj";
        var tempProjPath = (Folder.temp.fsName + "/" + tempProjName).replace(/\\/g, "/");
        
        try {
            // Normalizar rutas para evitar problemas de barras invertidas en Windows y asegurar compatibilidad
            var cleanOutPath = outPath.replace(/\\/g, "/");
            var cleanPresetPath = preset.replace(/\\/g, "/");
            var cleanHookPath = hook.fsName.replace(/\\/g, "/");
            var cleanMidPath = mid.fsName.replace(/\\/g, "/");
            var cleanCtaPath = cta.fsName.replace(/\\/g, "/");

            // 1. Crear nuevo proyecto vacío
            if (!app.newProject(tempProjPath)) {
                return { success: false, error: "No se pudo crear el proyecto temporal en: " + tempProjPath };
            }
            var project = app.project;

            // 2. Importar los 3 archivos de video
            var filesToImport = [cleanHookPath, cleanMidPath, cleanCtaPath];
            project.importFiles(filesToImport, false, project.rootItem, false);

            // 3. Buscar los ProjectItem importados (búsqueda robusta e insensible a mayúsculas/minúsculas)
            var hookItem = null;
            var midItem = null;
            var ctaItem = null;

            for (var i = 0; i < project.rootItem.children.numItems; i++) {
                var child = project.rootItem.children[i];
                var childNameLower = child.name.toLowerCase();
                
                var hookBase = hook.name.split(".")[0].toLowerCase();
                var midBase = mid.name.split(".")[0].toLowerCase();
                var ctaBase = cta.name.split(".")[0].toLowerCase();

                if (childNameLower.indexOf(hookBase) !== -1) {
                    hookItem = child;
                } else if (childNameLower.indexOf(midBase) !== -1) {
                    midItem = child;
                } else if (childNameLower.indexOf(ctaBase) !== -1) {
                    ctaItem = child;
                }
            }

            if (!hookItem) return { success: false, error: "No se encontró el clip de HOOK (" + hook.name + ") en el panel del proyecto." };
            if (!midItem) return { success: false, error: "No se encontró el clip de MID (" + mid.name + ") en el panel del proyecto." };
            if (!ctaItem) return { success: false, error: "No se encontró el clip de CTA (" + cta.name + ") en el panel del proyecto." };

            // 4. Crear la secuencia a partir del HOOK para heredar el formato vertical 1080x1920
            var seqName = "Seq_" + tempProjName;
            var sequence = project.createNewSequenceFromClips(seqName, [hookItem], project.rootItem);
            if (!sequence) {
                return { success: false, error: "No se pudo crear la secuencia a partir de HOOK." };
            }

            var videoTrack = sequence.videoTracks[0];
            if (videoTrack.clips.numItems < 1) {
                return { success: false, error: "La secuencia creada no contiene clips." };
            }

            // 5. Ajustar escala del HOOK si se requiere
            var settings = sequence.getSettings();
            var seqWidth = settings.videoFrameWidth;
            var seqHeight = settings.videoFrameHeight;
            
            if (scaleClips) {
                setClipScaleToFit(videoTrack.clips[0], seqWidth, seqHeight);
            }

            // 6. Insertar el clip MID justo al final del HOOK
            var hookClip = videoTrack.clips[0];
            videoTrack.insertClip(midItem, hookClip.end);
            if (videoTrack.clips.numItems < 2) {
                return { success: false, error: "No se pudo insertar el clip MID en la secuencia." };
            }

            // Ajustar escala del MID si se requiere
            var midClip = videoTrack.clips[1];
            if (scaleClips) {
                setClipScaleToFit(midClip, seqWidth, seqHeight);
            }

            // 7. Insertar el clip CTA justo al final del MID
            videoTrack.insertClip(ctaItem, midClip.end);
            if (videoTrack.clips.numItems < 3) {
                return { success: false, error: "No se pudo insertar el clip CTA en la secuencia." };
            }

            // Ajustar escala del CTA si se requiere
            var ctaClip = videoTrack.clips[2];
            if (scaleClips) {
                setClipScaleToFit(ctaClip, seqWidth, seqHeight);
            }

            // 8. Exportar secuencia directamente (modo síncrono entero: 0)
            var exportSuccess = sequence.exportAsMediaDirect(cleanOutPath, cleanPresetPath, 0);

            // 9. Cerrar proyecto temporal descartando todos los cambios para no saturar memoria
            project.closeDocument(0, 0);
            
            // Borrar archivo .prproj temporal del disco
            var diskProjFile = new File(tempProjPath);
            if (diskProjFile.exists) {
                diskProjFile.remove();
            }

            if (!exportSuccess) {
                return { success: false, error: "exportAsMediaDirect devolvió false (falló la codificación/exportación)." };
            }

            return { success: true };

        } catch (e) {
            // Cerrar proyecto si quedó abierto por error
            if (app.project) {
                try {
                    app.project.closeDocument(0, 0);
                } catch (err) {}
            }
            return { success: false, error: "Excepción: " + e.message + " (Línea: " + e.line + ")" };
        }
    }

    // Escalar clip para que llene / encaje en la secuencia de forma proporcional
    function setClipScaleToFit(trackItem, seqWidth, seqHeight) {
        try {
            var dimensions = getClipDimensions(trackItem.projectItem);
            if (!dimensions) return;
            
            var clipW = dimensions.width;
            var clipH = dimensions.height;
            
            var scaleX = seqWidth / clipW;
            var scaleY = seqHeight / clipH;
            
            // Usamos el menor ratio para asegurar que todo el video encaje en pantalla sin deformarse
            var scaleRatio = Math.min(scaleX, scaleY);
            var scaleValue = scaleRatio * 100;
            
            // Localización: "Motion" en inglés, "Movimiento" en español
            var motionComponent = null;
            for (var c = 0; c < trackItem.components.numItems; c++) {
                var comp = trackItem.components[c];
                if (comp.displayName === "Motion" || comp.displayName === "Movimiento" || comp.name === "Motion") {
                    motionComponent = comp;
                    break;
                }
            }
            
            if (motionComponent) {
                var scaleProp = null;
                for (var p = 0; p < motionComponent.properties.numItems; p++) {
                    var prop = motionComponent.properties[p];
                    if (prop.displayName === "Scale" || prop.displayName === "Escala" || prop.name === "Scale") {
                        scaleProp = prop;
                        break;
                    }
                }
                
                if (scaleProp) {
                    scaleProp.setValue(scaleValue, true);
                }
            }
        } catch(e) {
            // Ignorar errores si no se puede acceder a las propiedades
        }
    }

    // Obtener dimensiones del clip desde metadatos XML
    function getClipDimensions(projectItem) {
        try {
            var metadata = projectItem.getProjectMetadata();
            // Buscar la etiqueta que contiene la información de resolución (ej. "1080 x 1920" o "1080 x 1920 (1.0)")
            var match = metadata.match(/<premierePrivateProjectMetaData:Column.Intrinsic.VideoInfo>(.*?)<\/premierePrivateProjectMetaData:Column.Intrinsic.VideoInfo>/);
            if (match && match.length > 1) {
                var videoInfo = match[1];
                var parts = videoInfo.split(' ');
                if (parts.length >= 3) {
                    var w = parseInt(parts[0], 10);
                    var h = parseInt(parts[2], 10);
                    if (!isNaN(w) && !isNaN(h)) {
                        return { width: w, height: h };
                    }
                }
            }
        } catch(e) {}
        return null;
    }

    // Escanear carpeta buscando archivos válidos
    function scanFolderForFiles(folderPath, prefix, count) {
        var folder = new Folder(folderPath);
        if (!folder.exists) return {};
        
        var files = folder.getFiles();
        var fileMap = {};
        var regex;
        
        if (prefix === "HOOK") {
            regex = new RegExp("^HOOK_(\\d{3})_EDITADO\\.mp4$", "i");
        } else if (prefix === "MID") {
            regex = new RegExp("^MID_(\\d+)_EDITADO\\.mp4$", "i");
        } else if (prefix === "CTA") {
            regex = new RegExp("^CTA_(\\d+)_EDITADO\\.mp4$", "i");
        }
        
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file instanceof File) {
                var match = regex.exec(file.name);
                if (match) {
                    var num = parseInt(match[1], 10);
                    if (num >= 1 && num <= count) {
                        fileMap[num] = file;
                    }
                }
            }
        }
        return fileMap;
    }

    // Obtener la cantidad máxima/número de archivos que coinciden con el patrón en la carpeta
    function getFileCountInFolder(folderPath, prefix) {
        var folder = new Folder(folderPath);
        if (!folder.exists) return 0;
        
        var files = folder.getFiles();
        var maxIndex = 0;
        var regex;
        
        if (prefix === "HOOK") {
            regex = new RegExp("^HOOK_(\\d{3})_EDITADO\\.mp4$", "i");
        } else if (prefix === "MID") {
            regex = new RegExp("^MID_(\\d+)_EDITADO\\.mp4$", "i");
        } else if (prefix === "CTA") {
            regex = new RegExp("^CTA_(\\d+)_EDITADO\\.mp4$", "i");
        }
        
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file instanceof File) {
                var match = regex.exec(file.name);
                if (match) {
                    var num = parseInt(match[1], 10);
                    if (num > maxIndex) {
                        maxIndex = num;
                    }
                }
            }
        }
        return maxIndex;
    }

    // Comprobar espacio disponible en disco (multiplataforma)
    function getFreeSpaceGB(path) {
        try {
            var isWindows = ($.os.indexOf("Windows") !== -1);
            if (isWindows) {
                var drive = path.substring(0, 2); // ej: "C:"
                // Ejecutar powershell para obtener espacio libre en bytes
                var cmd = 'powershell -Command "(Get-PSDrive ' + drive.charAt(0) + ').Free"';
                var result = system.callSystem(cmd);
                if (result) {
                    var bytes = parseFloat(result.replace(/[^0-9]/g, ''));
                    if (!isNaN(bytes)) {
                        return bytes / (1024 * 1024 * 1024);
                    }
                }
            } else {
                // macOS: usar comando df
                var cmd = 'df -k "' + path + '" | awk \'NR==2 {print $4}\'';
                var result = system.callSystem(cmd);
                if (result) {
                    var kb = parseFloat(result.replace(/[^0-9]/g, ''));
                    if (!isNaN(kb)) {
                        return kb / (1024 * 1024); // de KB a GB
                    }
                }
            }
        } catch(e) {}
        return -1; // Falló la lectura
    }

    // Guardar logs en disco
    function writeLog(file, message) {
        try {
            var timestamp = getTimestamp();
            if (file.open("a")) {
                file.writeln("[" + timestamp + "] " + message);
                file.close();
            }
        } catch(e) {}
    }

    // Funciones de formato de tiempo
    function getTimestamp() {
        var d = new Date();
        return padZero(d.getDate(), 2) + "/" + padZero(d.getMonth() + 1, 2) + "/" + d.getFullYear() + " " +
               padZero(d.getHours(), 2) + ":" + padZero(d.getMinutes(), 2) + ":" + padZero(d.getSeconds(), 2);
    }

    function formatDuration(sec) {
        var h = Math.floor(sec / 3600);
        var m = Math.floor((sec % 3600) / 60);
        var s = sec % 60;
        return padZero(h, 2) + ":" + padZero(m, 2) + ":" + padZero(s, 2);
    }

    // Asegura ceros a la izquierda
    function padZero(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    // Funciones de Configuración de Archivo
    function loadConfig() {
        var cfg = {
            rootFolder: "",
            outputFolder: "",
            presetPath: "",
            hooksCount: "80",
            midsCount: "3",
            ctasCount: "3",
            hooksStart: "1",
            hooksEnd: "80",
            scaleToFit: true,
            overwrite: false,
            minDiskSpace: "50"
        };
        
        try {
            var f = new File(configFilePath);
            if (f.exists && f.open("r")) {
                while (!f.eof) {
                    var line = f.readln();
                    var parts = line.split("=");
                    if (parts.length >= 2) {
                        var key = parts[0];
                        var val = parts.slice(1).join("=");
                        if (key === "rootFolder") cfg.rootFolder = val;
                        else if (key === "outputFolder") cfg.outputFolder = val;
                        else if (key === "presetPath") cfg.presetPath = val;
                        else if (key === "hooksCount") cfg.hooksCount = val;
                        else if (key === "midsCount") cfg.midsCount = val;
                        else if (key === "ctasCount") cfg.ctasCount = val;
                        else if (key === "hooksStart") cfg.hooksStart = val;
                        else if (key === "hooksEnd") cfg.hooksEnd = val;
                        else if (key === "scaleToFit") cfg.scaleToFit = (val === "true");
                        else if (key === "overwrite") cfg.overwrite = (val === "true");
                        else if (key === "minDiskSpace") cfg.minDiskSpace = val;
                    }
                }
                f.close();
            }
        } catch(e) {}
        return cfg;
    }

    function saveConfig(cfg) {
        try {
            var f = new File(configFilePath);
            if (f.open("w")) {
                f.writeln("rootFolder=" + cfg.rootFolder);
                f.writeln("outputFolder=" + cfg.outputFolder);
                f.writeln("presetPath=" + cfg.presetPath);
                f.writeln("hooksCount=" + cfg.hooksCount);
                f.writeln("midsCount=" + cfg.midsCount);
                f.writeln("ctasCount=" + cfg.ctasCount);
                f.writeln("hooksStart=" + cfg.hooksStart);
                f.writeln("hooksEnd=" + cfg.hooksEnd);
                f.writeln("scaleToFit=" + (cfg.scaleToFit ? "true" : "false"));
                f.writeln("overwrite=" + (cfg.overwrite ? "true" : "false"));
                f.writeln("minDiskSpace=" + cfg.minDiskSpace);
                f.close();
            }
        } catch(e) {}
    }
})();
