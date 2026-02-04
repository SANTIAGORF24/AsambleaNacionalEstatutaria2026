#!/bin/bash

# Script para subir cambios rápidamente

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${YELLOW}📦 Subiendo cambios...${NC}"

# Verificar si hay cambios
if [[ -z $(git status -s) ]]; then
    echo -e "${RED}❌ No hay cambios para subir${NC}"
    exit 0
fi

# Mostrar cambios
echo -e "${YELLOW}📝 Cambios detectados:${NC}"
git status -s

# Agregar todos los cambios
git add .

# Pedir mensaje de commit (opcional)
if [ -z "$1" ]; then
    read -p "💬 Mensaje del commit (Enter para 'Actualización'): " mensaje
    if [ -z "$mensaje" ]; then
        mensaje="Actualización"
    fi
else
    mensaje="$1"
fi

# Hacer commit
git commit -m "$mensaje"

# Push
echo -e "${YELLOW}🚀 Subiendo a GitHub...${NC}"
git push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Cambios subidos exitosamente!${NC}"
else
    echo -e "${RED}❌ Error al subir cambios${NC}"
    exit 1
fi
