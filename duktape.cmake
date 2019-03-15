set(DUKTAPEDIR ${CMAKE_CURRENT_LIST_DIR}/lib/duktape)

include_directories(
  ${DUKTAPEDIR}/src
  ${DUKTAPEDIR}/extras/module-duktape
  ${DUKTAPEDIR}/extras/console
)

add_library(duktape STATIC
  ${DUKTAPEDIR}/src/duktape.c
  ${DUKTAPEDIR}/extras/module-duktape/duk_module_duktape.c
  ${DUKTAPEDIR}/extras/console/duk_console.c
)

if("${CMAKE_SYSTEM_NAME}" MATCHES "Linux")
  target_link_libraries(duktape
    m dl rt
  )
endif()
