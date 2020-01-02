#!/usr/bin/env bash


DOWNLOAD_DIR=downloads
FORMAT=all
JS=index.js

while (( $# > 0 ))
do
	
	case $1 in
		'-d') DOWNLOAD_DIR=$2;
			shift
			shift
		;;
		'-k') KEY=$2;
			shift
			shift
		;;
		'-f') FORMAT=$2;
			shift
			shift
		;;
		'-a') JS=audio.js;
		shift
		;;
	esac

done

mkdir -p ${DOWNLOAD_DIR}

CMD="nodejs ${JS} -f ${FORMAT} -d ${DOWNLOAD_DIR} "

if [ ! -z "${KEY}" ]
then
	CMD=${CMD}" -k ${KEY}"
fi

${CMD}

